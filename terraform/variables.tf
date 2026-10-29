
variable "aws_region" {
  description = "AWS region"
  type        = string
}
variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets"
  type        = list(string)
}
variable "public_subnet_azs" {
  description = "List of availability zones for public subnets"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "List of CIDR blocks for private subnets"
  type        = list(string)
}
variable "private_subnet_azs" {
  description = "List of availability zones for private subnets"
  type        = list(string)
}
variable "db_name" {
  description = "Name for db"
  type = string
}
variable "db_username" {
  description = "Username for db"
  type = string
}
variable "db_password" {
  description = "Password for db"
  type = string
}
variable "instance_type" {
  description = "Instance type for EC2 instances"
  type        = string
}
variable "key_name" {
  description = "Key pair name for EC2 instances"
  type        = string
}
variable "min_size" {
  description = "Minimum size of ASG"
  type        = number
}
variable "max_size" {
  description = "Maximum size of ASG"
  type        = number
}
variable "desired_capacity" {
  description = "Desired capacity of ASG"
  type        = number
}