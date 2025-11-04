#!/bin/bash
echo "🚀 Deploying MuseVersion to Vultr..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create app directory
sudo mkdir -p /opt/museversion
sudo chown $USER:$USER /opt/museversion

# Copy files
cp -r . /opt/museversion/
cd /opt/museversion

# Install dependencies
npm install

# Create service
sudo cat > /etc/systemd/system/museversion.service << EOF
[Unit]
Description=MuseVersion Museum Scanner
After=network.target

[Service]
Type=exec
User=$USER
WorkingDirectory=/opt/museversion
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl daemon-reload
sudo systemctl enable museversion
sudo systemctl start museversion

echo "✅ Deployment complete!"
echo "🌐 App running on: http://139.84.143.22:5000"