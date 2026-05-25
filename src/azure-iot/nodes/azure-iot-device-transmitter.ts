import { Message } from "azure-iot-device";
import { AzureIoTDevice, Status } from "../common/base";
import { AzureIoTDeviceNodeCredentials, AzureIoTDeviceNodeDef } from "../common/types";
import {Node, NodeMessageInFlow} from "node-red";

export class AzureIoTDeviceTransmitter extends AzureIoTDevice {
    constructor(node: Node<AzureIoTDeviceNodeCredentials>, config: AzureIoTDeviceNodeDef) {
        super(node, config);

        this.node.on('input', this.processInputMessage);
    }

    private processInputMessage = (messageIn: NodeMessageInFlow): void => {
        var hostname, sasKey, deviceId, protocol;

        if (this.deviceId === "") {
            if (!messageIn.hasOwnProperty("deviceId") || typeof messageIn.deviceId !== "string") {
                this.error("'deviceId' is not configured in node! Message is incorrect: 'deviceId' must be a string.");
                return;
            }
            deviceId = messageIn.deviceId;
        } else {
            deviceId = this.deviceId;
        }
        if (this.sasKey === "") {
            if (!messageIn.hasOwnProperty("sasKey") || typeof messageIn.sasKey !== "string") {
                this.error("'sasKey' is not configured in node! Message is incorrect: 'sasKey' must be a string.");
                return;
            }
            sasKey = messageIn.sasKey;
        } else {
            sasKey = this.sasKey;
        }
        if (this.hostname === "") {
            if (!messageIn.hasOwnProperty("hostname") || typeof messageIn.hostname !== "string") {
                this.error("'hostname' is not configured in node! Message is incorrect: 'hostname' must be a string.");
                return;
            }
            hostname = messageIn.hostname;
        } else {
            hostname = this.hostname;
        }
        if (this.protocol === "Defined in Message") {
            if (!messageIn.hasOwnProperty("protocol") || typeof messageIn.protocol !== "string") {
                this.error("'protocol' is not configured in node! Message is incorrect: 'protocol' must be a string.");
                return;
            }
            protocol = messageIn.protocol;
        } else {
            protocol = this.protocol;
        }
        if (this.client === undefined) {
            this.hostname = hostname;
            this.deviceId = deviceId;
            this.sasKey = sasKey;
            this.protocol = protocol;
            this.connect();
        } else if (
            this.hostname !== hostname ||
            this.deviceId !== deviceId ||
            this.sasKey !== sasKey ||
            this.protocol !== protocol
        ) {
            this.node.debug("Connection data has changed.");
            this.disconnect();

            this.hostname = hostname;
            this.deviceId = deviceId;
            this.sasKey = sasKey;
            this.protocol = protocol;
            this.connect();
        }

        const payload = typeof (messageIn.payload) != "string" ? messageIn.payload : JSON.parse(messageIn.payload);
        const properties = messageIn.hasOwnProperty("properties") && Array.isArray(messageIn.properties) ? messageIn.properties : [];
        this.sendMessage(payload, properties);
    };

    private sendMessage = (data: any, properties: any[]) => {
        if (this.client !== undefined) {
            const message = new Message(JSON.stringify(data));
            message.properties.propertyList = properties;

            this.node.debug(`Sending Message to Azure IoT Hub\n\tPayload: ${message.getData()}\n\tProperties: ${JSON.stringify(message.properties.propertyList)}`);
            this.node.status(Status.sent);
            this.client.sendEvent(message, (error, _response) => {
                if (error) {
                    this.error(`Error while trying to send message: ${error}`);
                } else {
                    this.node.debug("Message sent.");
                    this.node.send({ payload: "Message sent." });
                    this.node.status(Status.connected);
                }
            });
        }
    };
}
