output "database_security_group_id" {
  description = "Security group ID for database"
  value       = aws_security_group.database[*].id
}
output "app_security_group_id" {
  description = "Security group ID for application servers"
  value       = aws_security_group.app[*].id
}
output "alb_security_group_id" {
  description = "Security group ID for ALB"
  value       = aws_security_group.alb[*].id
}
output "bastion_security_group_id" {
  description = "Security group ID for bastion host"
  value       = aws_security_group.bastion[*].id
}