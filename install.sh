#!/usr/bin/env bash
# ==============================================================================
#  SHADOW CAT — Quick Installer & Environment Setup
# ==============================================================================
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "  ____  _   _    _    ____   _____        __   ____    _  _____ "
echo " / ___|| | | |  / \  |  _ \ / _ \ \      / /  / ___|  / \|_   _|"
echo " \___ \| |_| | / _ \ | | | | | | \ \ /\ / /  | |     / _ \ | |  "
echo "  ___) |  _  |/ ___ \| |_| | |_| |\ V  V /   | |___ / ___ \| |  "
echo " |____/|_| |_/_/   \_\____/ \___/  \_/\_/     \____/_/   \_\_|  "
echo -e "${NC}"
echo -e "${GREEN}[*] Autonomous Security & Tactical CTF Operations Suite${NC}"
echo "=============================================================================="

# 1. Check Python version
echo -e "\n[*] Step 1: Checking Python environment..."
PYTHON_CMD=""
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo -e "${RED}[!] Error: Python 3 is required but not found on your system.${NC}"
    echo "Please install Python 3.9 or higher and rerun this script."
    exit 1
fi

PY_VER=$($PYTHON_CMD -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo -e "    Found: ${GREEN}Python $PY_VER${NC} ($($PYTHON_CMD --version))"

# 2. Setup Virtual Environment
echo -e "\n[*] Step 2: Preparing isolated Python virtual environment..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/backend/venv"

if [ ! -d "$VENV_DIR" ]; then
    echo "    Creating virtual environment at $VENV_DIR..."
    $PYTHON_CMD -m venv "$VENV_DIR"
fi

# 3. Upgrade pip & Install requirements
echo -e "\n[*] Step 3: Installing dependencies..."
"$VENV_DIR/bin/python" -m pip install --upgrade pip --quiet
"$VENV_DIR/bin/pip" install -r "$SCRIPT_DIR/backend/requirements.txt" --quiet

echo -e "    ${GREEN}Dependencies installed successfully!${NC}"

# 4. Make run script executable
chmod +x "$SCRIPT_DIR/run.sh"

echo -e "\n=============================================================================="
echo -e "${GREEN}[OK] SHADOW CAT Installation Complete!${NC}"
echo -e "=============================================================================="
echo -e "To start SHADOW CAT at any time, run:"
echo -e "    ${CYAN}./run.sh${NC}"
echo ""
echo -e "The platform will open automatically at: ${GREEN}http://localhost:8000${NC}"
echo -e "==============================================================================\n"

# Prompt to launch immediately
read -p "Would you like to start SHADOW CAT right now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    exec "$SCRIPT_DIR/run.sh"
fi
