import { Client } from "azure-iot-device";
import { NodeStatus } from "node-red";
import { AzureIoTDeviceNodeCredentials, AzureIoTDeviceNodeDef, Protocol } from "./types";
import { Amqp, AmqpWs } from "azure-iot-device-amqp";
import { Mqtt } from "azure-iot-device-mqtt";
import { Http } from "azure-iot-device-http";
import { Node } from "node-red";

export const Status = {
    disconnected: { fill: "red", shape: "dot", text: "node-red:common.status.disconnected" },
    connected: { fill: "green", shape: "dot", text: "node-red:common.status.connected" },
    sent: { fill: "blue", shape: "dot", text: "nkaaf:common.status.sent" },
    received: { fill: "yellow", shape: "dot", text: "nkaaf:common.status.received" },
    error: { fill: "grey", shape: "dot", text: "node-red:common.status.error" }
} satisfies Record<string, NodeStatus>;

export const Protocols: Record<string, Protocol> = {
    amqp: Amqp,
    amqpWs: AmqpWs,
    mqtt: Mqtt,
    http: Http
};

export abstract class AzureIoTDevice {
    protected readonly node: Node<AzureIoTDeviceNodeCredentials>;
    protected client: Client | undefined;

    protected hostname: string;
    protected deviceId: string;
    protected sasKey: string;
    protected protocol: string;

    protected constructor(node: Node<AzureIoTDeviceNodeCredentials>, config: AzureIoTDeviceNodeDef) {
        this.node = node;

        this.hostname = config.hostname;
        this.deviceId = config.deviceId;
        this.sasKey = config.sasKey;
        this.protocol = config.protocol;

        this.node.on('close', this.disconnect);
    }

    protected buildConnectionString(): string {
        return `HostName=${this.hostname};DeviceId=${this.deviceId};SharedAccessKey=${this.sasKey}`;
    }

    protected error = (message: string): void => {
        this.node.error(message);
        this.node.status(Status.error);
    };

    protected disconnect = (): void => {
        if (this.client !== undefined) {
            this.node.debug("Disconnect from Azure...");
            this.client.removeAllListeners();
            this.client.close(() => {
                this.node.status(Status.disconnected);
                this.client = undefined;
            });
            this.node.debug("Disconnected from Azure.");
        }
    };

    protected connect = (): void => {
        const connectionString = this.buildConnectionString();

        this.node.debug(`Connecting to Azure:\n\tProtocol: ${this.protocol}\n\tConnection string: ${connectionString}`);

        const client = Client.fromConnectionString(connectionString, Protocols[this.protocol]);
        client.open((error) => {
            if (error) {
                this.error(`Could not connect to Azure: ${error}`);
            } else {
                this.node.debug("Connected to Azure.");
                this.node.status(Status.connected);

                client.on('error', (err) => {
                    this.error(err.message);
                });

                client.on("disconnect", this.disconnect);
            }
        });

        this.client = client;
    };
}
