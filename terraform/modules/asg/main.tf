# auto scaling group module
resource "aws_launch_template" "main" {
  name_prefix   = "${var.environment}-lt"
  image_id      = "ami-0c02fb55956c7d316" # Amazon Linux 2
  instance_type = var.instance_type
  key_name      = var.key_name
  vpc_security_group_ids = var.security_group_ids
  user_data = base64encode(<<-EOF
              #!/bin/bash
              cat << 'PYEOF' > /tmp/health_server.py
              import http.server
              import socketserver

              PORT = 5050

              class HealthHandler(http.server.SimpleHTTPRequestHandler):
                  def do_GET(self):
                      self.send_response(200)
                      self.send_header("Content-type", "text/plain")
                      self.end_headers()
                      self.wfile.write(b"OK")

              with socketserver.TCPServer(("", PORT), HealthHandler) as httpd:
                  print(f"Serving health check on port {PORT}")
                  httpd.serve_forever()
              PYEOF

              # Chạy script Python dưới nền (background)
              nohup python3 /tmp/health_server.py > /dev/null 2>&1 &
              EOF
  )
  
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.environment}-web-instance"
      Environment = var.environment
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}
resource "aws_instance" "bastion" {
  count         = 1
  ami           = "ami-0c02fb55956c7d316" # Amazon Linux 2
  instance_type = var.instance_type
  key_name      = var.key_name
  subnet_id     = element(var.public_subnet_ids, 0)
  vpc_security_group_ids = var.bastion_security_group_id

  tags = {
    Name        = "${var.environment}-web-instance-${count.index + 1}"
    Environment = var.environment
  }
}
resource "aws_autoscaling_group" "main" {
  name                = "${var.environment}-asg"
  vpc_zone_identifier = var.private_subnet_ids
  target_group_arns   = var.target_group_arns
  health_check_type   = "ELB"
  health_check_grace_period = 300

  min_size         = var.min_size
  max_size         = var.max_size
  desired_capacity = var.desired_capacity

  launch_template {
    id      = aws_launch_template.main.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.environment}-web-instance"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }
}
