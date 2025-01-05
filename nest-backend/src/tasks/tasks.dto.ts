import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
export class UpdateTaskStatusDto {
  @ApiProperty({
    description: 'New status of the task',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus, {
    message: 'Status must be one of: pending, in-progress, completed, expired',
  })
  status: TaskStatus;
}


export class CreateTaskDto {
  @IsString()
  @IsOptional() // ID is often generated by the backend and might not be required during creation
  id?: string; // Task ID (optional, generated by backend)

  @IsString()
  userId: string; // User ID the task belongs to

  @IsString()
  title: string; // Task title

  @IsEnum(TaskStatus)
  status: TaskStatus; // Task status (e.g., "pending", "in-progress", "completed", "expired")

  @IsString()
  category: string; // Task category (renamed from "label" to match Task type)

  @IsEnum(TaskPriority)
  priority: TaskPriority; // Task priority (e.g., "low", "medium", "high")

  @IsString()
  @IsOptional()
  description?: string; // Task description (optional for flexibility)

  @IsDateString()
  @IsOptional()
  startDate?: Date; // Task start date (optional)

  @IsDateString()
  @IsOptional()
  endDate?: Date; // Task end date (optional)

  @IsDateString()
  @IsOptional()
  dueTime?: Date; // Task due time (optional)

  @IsNumber()
  @IsOptional()
  estimatedTime?: number; // Estimated time in hours (optional)

  @IsBoolean()
  isOnCalendar?: boolean;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  id?: string; // Optional task ID (usually not updated)

  @IsOptional()
  @IsString()
  userId?: string; // Optional user ID (not typically updated)

  @IsOptional()
  @IsString()
  title?: string; // Optional task title update

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus; // Optional task status update

  @IsOptional()
  @IsString()
  label?: string; // Optional task label/category update

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority; // Optional task priority update

  @IsOptional()
  @IsString()
  description?: string; // Optional task description update

  @IsOptional()
  @IsDateString()
  startDate?: Date; // Optional task start date update

  @IsOptional()
  @IsDateString()
  endDate?: Date; // Optional task end date update

  @IsOptional()
  @IsDateString()
  dueTime?: Date; // Optional task due time update

  @IsOptional()
  @IsNumber()
  estimatedTime?: number; // Optional estimated time update

  @IsBoolean()
  isOnCalendar?: boolean;
}
