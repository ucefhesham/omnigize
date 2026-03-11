import { pgEnum } from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('user_status', ['Active', 'Suspended', 'Invited']);
export type UserStatus = typeof userStatusEnum.enumValues[number];

export const channelTypeEnum = pgEnum('channel_type', ['WhatsApp', 'Meta', 'Web', 'Email', 'Voice', 'Telegram', 'SMS']);
export type ChannelType = typeof channelTypeEnum.enumValues[number];

export const entityTypeEnum = pgEnum('entity_type_enum', ['Lead', 'Deal', 'Contact', 'Property', 'Task', 'Document', 'Company']);
export type EntityType = typeof entityTypeEnum.enumValues[number];

export const propertyStatusEnum = pgEnum('property_status', ['Available', 'Reserved', 'Sold', 'Rented']);
export type PropertyStatus = typeof propertyStatusEnum.enumValues[number];

export const docStatusEnum = pgEnum('doc_status', ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Signed']);
export type DocStatus = typeof docStatusEnum.enumValues[number];

export const pipelineStatusEnum = pgEnum('pipeline_status', ['Active', 'Archived']);
export type PipelineStatus = typeof pipelineStatusEnum.enumValues[number];

export const actionTypeEnum = pgEnum('action_type', ['Create', 'Update', 'Delete', 'Login', 'Logout', 'Approve', 'Reject', 'Move', 'View', 'Export']);
export type ActionType = typeof actionTypeEnum.enumValues[number];

export const taskPriorityEnum = pgEnum('task_priority', ['Low', 'Medium', 'High', 'Urgent']);
export type TaskPriority = typeof taskPriorityEnum.enumValues[number];

export const fieldTypeEnum = pgEnum('field_type', ['text', 'number', 'select', 'multiselect', 'date', 'datetime', 'boolean', 'textarea', 'gallery', 'location', 'repeater', 'url', 'email', 'phone', 'currency', 'percentage', 'json']);
export type FieldType = typeof fieldTypeEnum.enumValues[number];
