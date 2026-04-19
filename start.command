#!/bin/bash
# Move to the current directory where this script is located
cd "$(dirname "$0")" || exit

# Attempt to source nvm/npm paths typically on macOS if needed
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
fi

if [ -f "$HOME/.zshrc" ]; then
  source "$HOME/.zshrc"
elif [ -f "$HOME/.bash_profile" ]; then
  source "$HOME/.bash_profile"
fi

echo "Starting KitaabValue Next.js App..."
echo "If this is your first time, dependencies should already be installed."

# Run the dev server
npm run dev
