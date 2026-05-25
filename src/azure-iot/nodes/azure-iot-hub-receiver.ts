import { EventHubConsumerClient, latestEventPosition, Subscription } from "@azure/event-hubs";
import { Status } from "../common/base";
import { Node, NodeMessage } from "node-red";
import { AzureIoTHubReceiverNodeCredentials, AzureIoTHubReceiverNodeDef } from "../common/types";

export class AzureIoTHubReceiver {
    private readonly node: Node<AzureIoTHubReceiverNodeCredentials>;

    private client: EventHubConsumerClient | undefined;
    private subscription: Subscription | undefined;

    constructor(node: Node<AzureIoTHubReceiverNodeCredentials>, config: AzureIoTHubReceiverNodeDef) {
        this.node = node;
        this.node.on('close', this.disconnect);

        this.connect(config.connectionString, config.eventHubName, config.consumerGroup);
    }

    private connect = (connectionString: string, eventHubName: string, consumerGroup: string): void => {
        if (this.client === undefined) {
            this.client = eventHubName === "" ? new EventHubConsumerClient(consumerGroup, connectionString) : new EventHubConsumerClient(consumerGroup, connectionString, eventHubName);
            this.subscription = this.client.subscribe(
                {
                    processEvents: async (events, _context) => {
                        for (const event of events) {
                            this.node.debug(`Receive message\n\tBody: ${JSON.stringify(event.body)}\n\tCustom Properties: ${JSON.stringify(event.properties)}\n\tSystem Properties: ${JSON.stringify(event.systemProperties)}\n\tCorrelation ID: ${event.correlationId}\n\tMessage ID: ${event.messageId}`);

                            const nodeMessage: NodeMessage = {
                                payload: event.body,
                                custom_properties: event.properties,
                                system_properties: event.systemProperties,
                                correlation_id: event.correlationId,
                                message_id: event.messageId,
                            };
                            this.node.send(nodeMessage);
                        }
                        if (events.length > 0) {
                            // TODO: Why is there sometimes a message received without any event?
                            this.node.status(Status.received);
                            setTimeout(() => this.node.status(Status.connected), 1000);
                        }
                    },
                    processError: async (error, _context) => {
                        this.node.error(error);
                        this.node.status(Status.error);
                    },
                },
                { startPosition: latestEventPosition },
            );
            this.node.status(Status.connected);
        }
    };

    private disconnect = (): void => {
        if (this.client !== undefined) {
            this.node.debug("Disconnect from Azure...");

            let subscription_promise: Promise<void> | undefined;
            if (this.subscription !== undefined) {
                this.node.debug("Close subscription...");
                subscription_promise = this.subscription.close()
                    .then(() => this.node.debug("Subscription closed..."));
                this.subscription = undefined;
            }

            if (subscription_promise === undefined) {
                subscription_promise = Promise.resolve();
            }
            subscription_promise.then(() => {
                if (this.client !== undefined) {
                    this.client.close()
                        .then(() => {
                            this.node.status(Status.disconnected);
                            this.client = undefined;
                        });
                }
            });
        }
    }
}