variable "environment" {
  description = "Environment name"
  type        = string
}
variable "subnet_ids" {
  description = "List of subnet IDs"
  type        = list(string)
}
variable "db_name" {
  description = "Database name"
  type        = string
}
variable "db_username" {
  description = "Database username"
  type        = string
}
variable "db_password" {
  description = "Database password"
  type        = string
}
variable "security_group_ids" {
  description = "List of security group IDs"  
  type        = list(string)
}