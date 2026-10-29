# ALB Module

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnets" {
  description = "List of public subnet IDs"
  type        = list(string)
}
variable "alb_security_group_id" {
  description = "Security group ID for the ALB"
  type        = list(string)
}
