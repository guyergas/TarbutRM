@AGENTS.md

# Development & Deployment

## Running the Environment

This project uses **systemd services** for persistent, background execution. Services remain running even if your shell connection is lost.

### Development Environment

```bash
make run          # Start dev service (http://localhost:3001)
make stop         # Stop all services
sudo systemctl status tarbutrm-dev  # Check service status
sudo systemctl logs -u tarbutrm-dev  # View logs
```

### Production Environment

```bash
make prod         # Start prod service (http://localhost:80)
sudo systemctl status tarbutrm-prod # Check service status
sudo systemctl logs -u tarbutrm-prod # View logs
```

### Service Management (Direct)

If you need direct systemctl control without make:

```bash
sudo systemctl start tarbutrm-dev
sudo systemctl stop tarbutrm-dev
sudo systemctl restart tarbutrm-dev
sudo systemctl enable tarbutrm-dev   # Auto-start on boot
sudo systemctl disable tarbutrm-dev  # Disable auto-start
```

## Important Notes

- Services are defined in `/etc/systemd/system/tarbutrm-*.service`
- All services restart automatically on failure
- Logs are sent to systemd journal (journalctl)
- Only one environment (dev or prod) can run at a time due to port conflicts
