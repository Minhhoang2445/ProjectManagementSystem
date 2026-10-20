output "database_security_group_id" {
  description = "Security group ID for database"
  value       = aws_security_group.database[*].id
}