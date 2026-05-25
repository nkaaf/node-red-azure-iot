import { Message } from "azure-iot-device";
import { AzureIoTDevice, Status } from "../common/base";
import { AzureIoTDeviceNodeCredentials, AzureIoTDeviceNodeDef } from "../common/types";
import { Node, NodeMessage } from "node-red";

export class AzureIoTDeviceReceiver extends AzureIoTDevice {
    constructor(node: Node<AzureIoTDeviceNodeCredentials>, config: AzureIoTDeviceNodeDef) {
        super(node, config);

        this.connect();
        this.client?.on('message', this.processMessage)
    };

    private processMessage = (message: Message): void => {
        this.node.debug(`Message received from Azure IoT Hub\n\tId: ${message.messageId}\n\tPayload: ${message.getData()}\n\tProperties: ${message.properties.propertyList}`)
        this.node.status(Status.received);

        const nodeMessage: NodeMessage = {
            payload: message.getData(),
            properties: message.properties.propertyList
        };
        this.node.send(nodeMessage);

        this.client?.complete(message, () => this.node.status(Status.connected));
    };
}
