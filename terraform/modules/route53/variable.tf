variable "domain_name" {
  description = "Domain name for the Route 53 hosted zone"
  type        = string
}
variable "hosted_zone_name" {
  description = "Name of the Route 53 hosted zone"
  type        = string
}
variable "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  type        = string
}
variable "cloudfront_hosted_zone_id" {
  description = "Hosted zone ID of the CloudFront distribution"
  type        = string
}