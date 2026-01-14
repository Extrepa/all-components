#!/bin/bash
# Reset Obsidian Settings Script
# This script helps reset Obsidian settings to default

VAULT_PATH="/Users/extrepa/Documents/ErrlVault"
OBSIDIAN_DIR="$VAULT_PATH/.obsidian"

echo "⚠️  WARNING: This will reset Obsidian settings!"
echo "Vault path: $VAULT_PATH"
echo ""
echo "Options:"
echo "1. Reset only Errl OS plugin settings (safe)"
echo "2. Reset main Obsidian settings (appearance, workspace, etc.)"
echo "3. Reset everything (nuclear option)"
echo ""
read -p "Choose option (1/2/3): " choice

case $choice in
    1)
        echo "Resetting Errl OS plugin settings..."
        if [ -f "$OBSIDIAN_DIR/plugins/errl-os/data.json" ]; then
            mv "$OBSIDIAN_DIR/plugins/errl-os/data.json" "$OBSIDIAN_DIR/plugins/errl-os/data.json.backup"
            echo "✅ Errl OS settings backed up and reset"
        else
            echo "ℹ️  No Errl OS settings file found"
        fi
        ;;
    2)
        echo "Resetting main Obsidian settings..."
        if [ -f "$OBSIDIAN_DIR/appearance.json" ]; then
            mv "$OBSIDIAN_DIR/appearance.json" "$OBSIDIAN_DIR/appearance.json.backup"
        fi
        if [ -f "$OBSIDIAN_DIR/app.json" ]; then
            mv "$OBSIDIAN_DIR/app.json" "$OBSIDIAN_DIR/app.json.backup"
        fi
        if [ -f "$OBSIDIAN_DIR/workspace.json" ]; then
            mv "$OBSIDIAN_DIR/workspace.json" "$OBSIDIAN_DIR/workspace.json.backup"
        fi
        echo "✅ Main Obsidian settings backed up and reset"
        ;;
    3)
        echo "⚠️  NUCLEAR OPTION: Resetting everything..."
        read -p "Are you sure? Type 'yes' to confirm: " confirm
        if [ "$confirm" = "yes" ]; then
            if [ -d "$OBSIDIAN_DIR" ]; then
                mv "$OBSIDIAN_DIR" "$OBSIDIAN_DIR.backup.$(date +%Y%m%d_%H%M%S)"
                echo "✅ Entire .obsidian folder backed up"
            fi
        else
            echo "❌ Cancelled"
            exit 1
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done! Please restart Obsidian for changes to take effect."


