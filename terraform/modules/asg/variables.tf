variable "environment" {
  description = "Environment name"
  type        = string
}
variable "instance_type" {
  description = "Instance type"
  type        = string
}
variable "key_name" {
  description = "Key pair name"
  type        = string
}
variable "security_group_ids" {
  description = "List of security group IDs"
  type        = list(string)
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
variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}
variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "target_group_arns" {
  description = "List of target group ARNs"
  type        = list(string)
}
variable "bastion_security_group_id"{
  description = "Security group for basstion ec2"
  type       = list(string)
}
