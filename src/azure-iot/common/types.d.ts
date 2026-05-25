import { Amqp, AmqpWs } from "azure-iot-device-amqp";
import { Http } from "azure-iot-device-http";
import { Mqtt } from "azure-iot-device-mqtt";
import { Node } from "node-red";
import { EditorNodeCredentials, EditorNodeProperties, EditorRED, NodeDef } from "node-red";

export declare const RED: EditorRED;

export type Protocol = typeof Amqp | typeof AmqpWs | typeof Http | typeof Mqtt;

export interface AzureIoTDeviceOptions {
    hostname: string;
    deviceId: string;
    sasKey: string;
    protocol: string;
}
export interface AzureIoTDeviceNodeProperties
    extends EditorNodeProperties, AzureIoTDeviceOptions { }

export interface AzureIoTDeviceNodeCredentials {
    sasKey: EditorNodeCredentials<string>;
}
export interface AzureIoTDeviceNodeDef extends NodeDef, AzureIoTDeviceOptions { }
export type AzureIoTDeviceTransmitterNode = Node<AzureIoTDeviceNodeCredentials>;
export type AzureIoTDeviceReceiverNode = Node<AzureIoTDeviceNodeCredentials>;

export interface AzureIoTHubReceiverOptions {
    connectionString: string;
    consumerGroup: string;
    eventHubName: string;
}
export interface AzureIoTHubReceiverNodeCredentials {
    connectionString: EditorNodeCredentials<string>;
}
export interface AzureIoTHubReceiverNodeProperties extends EditorNodeProperties, AzureIoTHubReceiverOptions {
}
export interface AzureIoTHubReceiverNodeDef extends NodeDef, AzureIoTHubReceiverOptions {
}
export type AzureIoTHubReceiverNode = Node<AzureIoTHubReceiverNodeCredentials>;


