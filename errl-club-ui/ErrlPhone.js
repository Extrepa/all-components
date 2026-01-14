/**
 * ErrlPhone - Compact phone interface consolidating all UI elements
 *
 * A cute, compact phone UI in the bottom right corner with 4 tabs:
 * 1. Menu - All controls/keybinds
 * 2. Map - Minimap/DiscoveryMap
 * 3. Avatar - Avatar info/stats
 * 4. Inventory - Items and achievements
 *
 * Vibe meter is always visible in the header
 *
 * Only one tab is visible at a time to save space
 */
import { KeybindManager } from '../input/KeybindManager.js';
import { VibesLiquidBar } from './components/VibesLiquidBar.js';

export class ErrlPhone {
    constructor(keybindManager = null, systems = null) {
        this.keybindManager = keybindManager;
        this.systems = systems;

        // Load last tab from localStorage, default to 'avatar' if none saved
        const savedTab =
            typeof window !== 'undefined' && window.localStorage
                ? window.localStorage.getItem('errlPhoneLastTab')
                : null;
        this.currentTab =
            savedTab && ['menu', 'map', 'avatar', 'inventory', 'music'].includes(savedTab)
                ? savedTab
                : 'avatar'; // Default to avatar tab

        this.phoneElement = null;
        this.tabContent = null;
        this.isCollapsed = true; // Start minimized by default
        this.wiggleInterval = null; // For wiggle animation
        this.outsideClickHandler = null; // For click-outside-to-minimize
        this.vibeBarContainer = null; // Thin vibe bar at top

        // Tab visibility state
        this.tabs = {
            menu: this.currentTab === 'menu',
            map: this.currentTab === 'map',
            avatar: this.currentTab === 'avatar',
        };

        this.createPhone();

        if (typeof window !== 'undefined') {
            window.errlPhoneInstance = this;
        }
    }

    setSystems(systems) {
        this.systems = systems;
        // Update all tabs with systems reference
        this.updateTabContent();
    }

    createPhone() {
        // Remove existing phone if it exists
        const existing = document.getElementById('errl-phone');
        if (existing) {
            existing.remove();
        }

        // Create phone container - no-bezel design
        this.phoneElement = document.createElement('div');
        this.phoneElement.id = 'errl-phone';
        this.phoneElement.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 140px;
            height: 200px;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 0, 40, 0.98) 100%);
            border: 1px solid #00ffff;
            border-radius: 12px;
            box-shadow: 
                0 0 10px rgba(0, 255, 255, 0.5),
                0 5px 20px rgba(0, 0, 0, 0.8),
                inset 0 0 10px rgba(0, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 10001;
            pointer-events: auto;
            font-family: 'Inter', system-ui, sans-serif;
            transform-origin: bottom right;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            cursor: pointer;
        `;

        // Header area with thin vibe bar at top
        const headerArea = document.createElement('div');
        headerArea.id = 'phone-header';
        headerArea.style.cssText = `
            height: 3px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            user-select: none;
            pointer-events: auto;
            z-index: 2;
            background: rgba(0, 0, 0, 0.3);
        `;

        // Thin vibe progress bar
        const vibeBarContainer = document.createElement('div');
        vibeBarContainer.id = 'phone-vibe-bar-container';
        vibeBarContainer.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 0%;
            height: 100%;
            background: linear-gradient(
                90deg,
                #ff0080 0%,
                #ff8000 14%,
                #ffff00 28%,
                #80ff00 42%,
                #00ff80 57%,
                #00ffff 71%,
                #0080ff 85%,
                #8000ff 100%
            );
            background-size: 200% 100%;
            background-position: 0% 0%;
            animation: rainbowFlow 3s linear infinite;
            transition: width 0.3s ease;
            box-shadow: 0 0 4px rgba(0, 255, 255, 0.6);
            z-index: 1;
        `;
        headerArea.appendChild(vibeBarContainer);

        // Store reference for updates
        this.vibeBarContainer = vibeBarContainer;

        // Add peel-down handler - click or drag header to collapse
        let dragStartY = null;
        let isDragging = false;

        headerArea.addEventListener('mousedown', (e) => {
            if (this.isCollapsed) {
                return;
            }
            dragStartY = e.clientY;
            isDragging = false;
            e.preventDefault();
        });

        headerArea.addEventListener('mousemove', (e) => {
            if (this.isCollapsed || dragStartY === null) {
                return;
            }
            const deltaY = e.clientY - dragStartY;
            if (Math.abs(deltaY) > 5) {
                isDragging = true;
                // Visual feedback - slightly move phone down
                this.phoneElement.style.transform = `translateY(${Math.min(deltaY, 50)}px)`;
            }
        });

        headerArea.addEventListener('mouseup', (e) => {
            if (this.isCollapsed) {
                return;
            }
            const deltaY = dragStartY ? e.clientY - dragStartY : 0;
            dragStartY = null;

            // Reset transform
            this.phoneElement.style.transform = '';

            // Collapse if dragged down more than 10px or just clicked
            if (isDragging && deltaY > 10) {
                e.stopPropagation();
                this.toggleCollapse();
            } else if (!isDragging) {
                // Simple click - collapse phone
                e.stopPropagation();
                this.toggleCollapse();
            }
            isDragging = false;
        });

        // Also add a simple click handler that works even if drag doesn't trigger
        // This handler is added after marquee is created to ensure it works
        headerArea.addEventListener(
            'click',
            (e) => {
                if (!this.isCollapsed) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.toggleCollapse();
                }
            },
            true
        ); // Use capture phase to ensure it fires

        headerArea.addEventListener('mouseleave', () => {
            if (dragStartY !== null) {
                dragStartY = null;
                this.phoneElement.style.transform = '';
                isDragging = false;
            }
        });

        // Touch support for mobile
        headerArea.addEventListener('touchstart', (e) => {
            if (this.isCollapsed) {
                return;
            }
            dragStartY = e.touches[0].clientY;
            isDragging = false;
            e.preventDefault();
        });

        headerArea.addEventListener('touchmove', (e) => {
            if (this.isCollapsed || dragStartY === null) {
                return;
            }
            const deltaY = e.touches[0].clientY - dragStartY;
            if (Math.abs(deltaY) > 5) {
                isDragging = true;
                this.phoneElement.style.transform = `translateY(${Math.min(deltaY, 50)}px)`;
            }
        });

        headerArea.addEventListener('touchend', (e) => {
            if (this.isCollapsed) {
                return;
            }
            const deltaY = dragStartY ? (e.changedTouches[0]?.clientY || 0) - dragStartY : 0;
            dragStartY = null;

            this.phoneElement.style.transform = '';

            if (isDragging && deltaY > 10) {
                this.toggleCollapse();
            } else if (!isDragging) {
                this.toggleCollapse();
            }
            isDragging = false;
        });

        // Store bubble click handler for later use
        this.bubbleClickHandler = (e) => {
            if (this.isCollapsed) {
                e.stopPropagation();
                this.toggleCollapse();
            }
        };

        this.phoneElement.appendChild(headerArea);

        // Add CSS animations for glittery effect and scrollbar marquee
        if (!document.getElementById('phone-vibe-animations')) {
            const style = document.createElement('style');
            style.id = 'phone-vibe-animations';
            style.textContent = `
                @keyframes rainbowFlow {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 200% 0%; }
                }
                @keyframes glitterMove {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(30px, 30px); }
                }
                
                /* Custom scrollbar with Vibes marquee */
                #phone-tab-content::-webkit-scrollbar {
                    width: 8px;
                }
                #phone-tab-content::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 4px;
                }
                #phone-tab-content::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 255, 0.3);
                    border-radius: 4px;
                    position: relative;
                }
                #phone-tab-content::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 255, 255, 0.5);
                }
                
                /* Firefox scrollbar */
                #phone-tab-content {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 255, 255, 0.3) rgba(0, 0, 0, 0.3);
                }
            `;
            document.head.appendChild(style);
        }

        // Tab content area - scrollable but scrollbar hidden
        this.tabContent = document.createElement('div');
        this.tabContent.id = 'phone-tab-content';
        this.tabContent.style.cssText = `
            flex: 1;
            width: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 8px;
            font-size: 8px;
            box-sizing: border-box;
            position: relative;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
        `;

        // Hide scrollbar but keep scrolling functionality
        const scrollbarStyle = document.createElement('style');
        scrollbarStyle.textContent = `
            #phone-tab-content::-webkit-scrollbar {
                display: none; /* Chrome, Safari, Opera */
            }
        `;
        document.head.appendChild(scrollbarStyle);

        this.phoneElement.appendChild(this.tabContent);

        // Close button (X) in top right corner of phone
        const closeButton = document.createElement('div');
        closeButton.id = 'phone-close-button';
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            position: absolute;
            right: 4px;
            top: 4px;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: rgba(255, 255, 255, 0.9);
            cursor: pointer;
            z-index: 100;
            pointer-events: auto;
            transition: all 0.2s ease;
            line-height: 1;
            font-weight: bold;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 50%;
        `;

        // Hover effect for close button
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.color = '#ff0000';
            closeButton.style.transform = 'scale(1.2)';
            closeButton.style.background = 'rgba(255, 0, 0, 0.2)';
            closeButton.style.textShadow = '0 0 8px rgba(255, 0, 0, 0.8)';
        });

        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.color = 'rgba(255, 255, 255, 0.9)';
            closeButton.style.transform = 'scale(1)';
            closeButton.style.background = 'rgba(0, 0, 0, 0.3)';
            closeButton.style.textShadow = 'none';
        });

        // Close phone when X is clicked
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.isCollapsed) {
                this.toggleCollapse();
            }
        });

        // Store reference to close button for showing/hiding
        this.closeButton = closeButton;

        this.phoneElement.appendChild(closeButton);

        // Tab navigation (bottom) - no-bezel, big icons, no text, no padding
        const tabNav = document.createElement('div');
        tabNav.id = 'phone-tab-nav';
        tabNav.style.cssText = `
            display: flex;
            width: 100%;
            height: 30px;
            border-top: 1px solid rgba(0, 255, 255, 0.3);
            background: rgba(0, 0, 0, 0.5);
            padding: 0;
            gap: 0;
            margin: 0;
            box-sizing: border-box;
        `;

        const tabs = [
            { id: 'menu', icon: '⚙️' },
            { id: 'map', icon: '🗺️' },
            { id: 'avatar', icon: '👤' },
            { id: 'inventory', icon: '🎒' },
            { id: 'music', icon: '🎵' },
        ];

        tabs.forEach((tab) => {
            const tabButton = document.createElement('button');
            tabButton.id = `phone-tab-${tab.id}`;
            tabButton.innerHTML = `<div style="font-size: 18px;">${tab.icon}</div>`;
            tabButton.style.cssText = `
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                border: none;
                padding: 0;
                margin: 0;
                color: ${this.currentTab === tab.id ? '#00ffff' : 'rgba(0, 255, 255, 0.5)'};
                cursor: pointer;
                transition: all 0.2s ease;
                border-top: 2px solid ${this.currentTab === tab.id ? '#00ffff' : 'transparent'};
                filter: ${this.currentTab === tab.id ? 'drop-shadow(0 0 4px rgba(0, 255, 255, 0.8))' : 'none'};
            `;

            tabButton.addEventListener('mouseenter', () => {
                if (this.currentTab !== tab.id) {
                    tabButton.style.color = 'rgba(0, 255, 255, 0.8)';
                    tabButton.style.filter = 'drop-shadow(0 0 2px rgba(0, 255, 255, 0.5))';
                }
            });
            tabButton.addEventListener('mouseleave', () => {
                if (this.currentTab !== tab.id) {
                    tabButton.style.color = 'rgba(0, 255, 255, 0.5)';
                    tabButton.style.filter = 'none';
                }
            });

            tabButton.addEventListener('click', () => {
                this.switchTab(tab.id);
            });

            tabNav.appendChild(tabButton);
        });

        this.phoneElement.appendChild(tabNav);
        document.body.appendChild(this.phoneElement);

        // Create initial tab content first
        this.updateTabContent();

        // Start minimized by default - do this AFTER content is created
        if (this.isCollapsed) {
            // Use setTimeout to ensure DOM is fully ready
            setTimeout(() => {
                this.collapseToBubble();
                this.startWiggleAnimation();
            }, 0);
        }
    }

    switchTab(tabId) {
        if (this.currentTab === tabId || this.isCollapsed) {
            return;
        }

        this.currentTab = tabId;

        // Save to localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('errlPhoneLastTab', tabId);
        }

        // Update tab button styles
        const tabButtons = this.phoneElement.querySelectorAll('#phone-tab-nav button');
        tabButtons.forEach((btn, index) => {
            const tabs = ['menu', 'map', 'avatar', 'inventory', 'music'];
            const isActive = tabs[index] === tabId;
            btn.style.color = isActive ? '#00ffff' : 'rgba(0, 255, 255, 0.5)';
            btn.style.borderTop = isActive ? '2px solid #00ffff' : 'transparent';
        });

        // Update tab content
        this.updateTabContent();
    }

    /**
     * Toggle collapse/expand - peel down to avatar bubble
     */
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;

        if (this.isCollapsed) {
            // Collapse to avatar bubble
            this.collapseToBubble();
        } else {
            // Expand back to full phone
            this.expandFromBubble();
        }
    }

    /**
     * Collapse phone to small avatar bubble
     */
    collapseToBubble() {
        // Remove outside click handler when collapsing
        if (this.outsideClickHandler) {
            document.removeEventListener('mousedown', this.outsideClickHandler, true);
        }
        // Get avatar color variant for bubble
        const avatar = this.systems?.avatar;
        const variantName = avatar?.colorVariant || 'classic_purple';
        const variant = this.systems?.avatar?.colorVariants?.[variantName] || {
            color: 0x8000ff,
            glow: 0.5,
        };

        // Convert hex to rgb
        const r = (variant.color >> 16) & 255;
        const g = (variant.color >> 8) & 255;
        const b = variant.color & 255;

        // Hide content, show only bubble
        this.tabContent.style.display = 'none';
        const tabNav = document.getElementById('phone-tab-nav');
        if (tabNav) {
            tabNav.style.display = 'none';
        }
        const header = document.getElementById('phone-header');
        if (header) {
            header.style.display = 'none';
        }

        // Hide close button when collapsed
        if (this.closeButton) {
            this.closeButton.style.display = 'none';
        }

        // Transform to bubble - preserve transition
        const currentTransition = this.phoneElement.style.transition;
        this.phoneElement.style.width = '40px';
        this.phoneElement.style.height = '40px';
        this.phoneElement.style.borderRadius = '50%';
        this.phoneElement.style.background = `radial-gradient(circle at 30% 30%, 
            rgba(${r}, ${g}, ${b}, 0.9), 
            rgba(${r * 0.6}, ${g * 0.6}, ${b * 0.6}, 0.95))`;
        this.phoneElement.style.border = `2px solid rgba(${r}, ${g}, ${b}, 0.8)`;
        this.phoneElement.style.boxShadow = `
            0 0 15px rgba(${r}, ${g}, ${b}, 0.8),
            0 0 30px rgba(${r}, ${g}, ${b}, 0.4),
            inset 0 0 10px rgba(255, 255, 255, 0.2)
        `;
        this.phoneElement.style.display = 'flex';
        this.phoneElement.style.alignItems = 'center';
        this.phoneElement.style.justifyContent = 'center';
        this.phoneElement.style.cursor = 'pointer';
        this.phoneElement.style.transition =
            currentTransition || 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

        // Add avatar icon (permanent) - from src/assets
        if (!this.bubbleIcon) {
            this.bubbleIcon = document.createElement('img');
            // Use import path for Vite - will be resolved at build time
            this.bubbleIcon.src = new URL('../../assets/avatar-icon.png', import.meta.url).href;
            this.bubbleIcon.alt = 'Avatar';
            this.bubbleIcon.style.cssText = `
                width: 24px;
                height: 24px;
                object-fit: contain;
                filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
                pointer-events: none;
            `;
            this.bubbleIcon.onerror = () => {
                // Fallback to emoji if image doesn't load
                this.bubbleIcon.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.textContent = '👤';
                fallback.style.cssText = `
                    font-size: 20px;
                    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
                    pointer-events: none;
                `;
                this.phoneElement.appendChild(fallback);
                this.bubbleIcon = fallback;
            };
            this.phoneElement.appendChild(this.bubbleIcon);
        }
        this.bubbleIcon.style.display = 'block';

        // Make entire bubble clickable to expand
        // Remove old handler if it exists (from previous collapse or initial setup)
        if (this.bubbleClickHandler) {
            this.phoneElement.removeEventListener('click', this.bubbleClickHandler);
        }

        // Create/update handler - use arrow function to preserve 'this'
        this.bubbleClickHandler = (e) => {
            e.stopPropagation();
            if (this.isCollapsed) {
                this.toggleCollapse();
            }
        };

        // Add handler for bubble state
        this.phoneElement.addEventListener('click', this.bubbleClickHandler);

        // Start wiggle animation when collapsed
        this.startWiggleAnimation();
    }

    /**
     * Start wiggle animation for the collapsed phone bubble
     */
    startWiggleAnimation() {
        // Stop any existing animation
        this.stopWiggleAnimation();

        if (!this.isCollapsed) {
            return;
        }

        // Random interval between 3-8 seconds
        const getRandomInterval = () => Math.random() * 5000 + 3000;

        const performWiggle = () => {
            if (!this.isCollapsed || !this.phoneElement) {
                return;
            }

            // Random wiggle amount (small movements)
            const wiggleX = (Math.random() - 0.5) * 8; // -4 to 4px
            const wiggleY = (Math.random() - 0.5) * 8;
            const wiggleRotate = (Math.random() - 0.5) * 15; // -7.5 to 7.5 degrees

            // Apply wiggle with smooth transition
            this.phoneElement.style.transition = 'transform 0.3s ease-out';
            this.phoneElement.style.transform = `translate(${wiggleX}px, ${wiggleY}px) rotate(${wiggleRotate}deg)`;

            // Return to center after wiggle
            setTimeout(() => {
                if (this.isCollapsed && this.phoneElement) {
                    this.phoneElement.style.transition = 'transform 0.5s ease-in-out';
                    this.phoneElement.style.transform = 'translate(0, 0) rotate(0deg)';
                }
            }, 300);

            // Schedule next wiggle
            this.wiggleInterval = setTimeout(performWiggle, getRandomInterval());
        };

        // Start first wiggle after a random delay
        this.wiggleInterval = setTimeout(performWiggle, getRandomInterval());
    }

    /**
     * Stop wiggle animation
     */
    stopWiggleAnimation() {
        if (this.wiggleInterval) {
            clearTimeout(this.wiggleInterval);
            this.wiggleInterval = null;
        }

        // Reset transform
        if (this.phoneElement) {
            this.phoneElement.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            this.phoneElement.style.transform = '';
        }
    }

    /**
     * Expand bubble back to full phone
     */
    expandFromBubble() {
        // Show content again
        this.tabContent.style.display = 'block';
        const tabNav = document.getElementById('phone-tab-nav');
        if (tabNav) {
            tabNav.style.display = 'flex';
            tabNav.style.width = '100%';
        }
        const header = document.getElementById('phone-header');
        if (header) {
            header.style.display = 'flex';
            // Ensure header is clickable
            header.style.pointerEvents = 'auto';
        }

        // Show close button when expanded
        if (this.closeButton) {
            this.closeButton.style.display = 'flex';
        }

        // Hide bubble icon
        if (this.bubbleIcon) {
            this.bubbleIcon.style.display = 'none';
        }

        // Remove bubble click handler when expanded (only header should collapse)
        if (this.bubbleClickHandler) {
            this.phoneElement.removeEventListener('click', this.bubbleClickHandler);
        }

        // Stop wiggle animation when expanded
        this.stopWiggleAnimation();

        // Restore ALL original phone styling properties
        this.phoneElement.style.position = 'fixed';
        this.phoneElement.style.bottom = '10px';
        this.phoneElement.style.right = '10px';
        this.phoneElement.style.width = '140px';
        this.phoneElement.style.height = '200px';
        this.phoneElement.style.borderRadius = '12px';
        this.phoneElement.style.background =
            'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 0, 40, 0.98) 100%)';
        this.phoneElement.style.border = '1px solid #00ffff';
        this.phoneElement.style.boxShadow = `
            0 0 10px rgba(0, 255, 255, 0.5),
            0 5px 20px rgba(0, 0, 0, 0.8),
            inset 0 0 10px rgba(0, 255, 255, 0.1)
        `;
        this.phoneElement.style.display = 'flex';
        this.phoneElement.style.flexDirection = 'column';
        this.phoneElement.style.overflow = 'hidden';
        this.phoneElement.style.zIndex = '10001';
        this.phoneElement.style.pointerEvents = 'auto';
        this.phoneElement.style.fontFamily = "'Inter', system-ui, sans-serif";
        this.phoneElement.style.transformOrigin = 'bottom right';
        this.phoneElement.style.cursor = 'pointer';
        this.phoneElement.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        // Reset transform in case wiggle left it
        this.phoneElement.style.transform = '';
    }

    updateTabContent() {
        if (!this.tabContent) {
            return;
        }

        this.tabContent.innerHTML = '';

        switch (this.currentTab) {
            case 'menu':
                this.createMenuTab();
                break;
            case 'map':
                this.createMapTab();
                break;
            case 'avatar':
                this.createAvatarTab();
                break;
            case 'inventory':
                this.createInventoryTab();
                break;
            case 'music':
                this.createMusicTab();
                break;
        }
    }

    createMenuTab() {
        // Movement & Camera section
        const movementSection = this.createCollapsibleSection(
            'Movement & Camera',
            this.getMovementKeybinds()
        );
        this.tabContent.appendChild(movementSection);

        // Interactions & Effects section
        const interactionsSection = this.createCollapsibleSection(
            'Interactions & Effects',
            this.getInteractionKeybinds()
        );
        this.tabContent.appendChild(interactionsSection);

        // Settings & UI section
        const settingsSection = this.createCollapsibleSection(
            'Settings & UI',
            this.getSettingsKeybinds()
        );
        this.tabContent.appendChild(settingsSection);

        // Visual Effects controls
        const effectsSection = document.createElement('div');
        effectsSection.style.cssText = `
            width: 100%;
            margin-top: 2px;
            padding: 2px;
            background: rgba(0, 255, 255, 0.1);
            border-radius: 2px;
            border: 1px solid rgba(0, 255, 255, 0.3);
            box-sizing: border-box;
        `;

        const effectsTitle = document.createElement('div');
        effectsTitle.textContent = 'Visual Effects';
        effectsTitle.style.cssText = `
            color: #00ffff;
            font-size: 6px;
            font-weight: bold;
            margin-bottom: 2px;
        `;
        effectsSection.appendChild(effectsTitle);

        // UV Mode toggle
        const uvToggle = this.createEffectToggle('UV Mode', 'uvMode', effectsSection);
        effectsSection.appendChild(uvToggle);

        // Glitch toggle
        const glitchToggle = this.createEffectToggle('Glitch', 'glitch', effectsSection);
        effectsSection.appendChild(glitchToggle);

        // Bloom intensity quick control
        if (this.systems?.visualEffectSettings) {
            const bloomControl = this.createEffectSlider('Bloom', 'bloomIntensity', effectsSection);
            effectsSection.appendChild(bloomControl);
        }

        this.tabContent.appendChild(effectsSection);

        // Camera controls
        const cameraSection = document.createElement('div');
        cameraSection.style.cssText = `
            width: 100%;
            margin-top: 2px;
            padding: 2px;
            background: rgba(0, 255, 255, 0.1);
            border-radius: 2px;
            border: 1px solid rgba(0, 255, 255, 0.3);
            box-sizing: border-box;
        `;

        // Camera Intensity split button
        const intensityContainer = document.createElement('div');
        intensityContainer.style.cssText = `
            display: flex;
            width: 100%;
            margin-bottom: 4px;
            border: 1px solid rgba(0, 255, 255, 0.4);
            border-radius: 3px;
            overflow: hidden;
        `;

        // Left side - label (not clickable)
        const intensityLabel = document.createElement('div');
        intensityLabel.textContent = 'Camera Intensity';
        intensityLabel.style.cssText = `
            flex: 1;
            padding: 4px 6px;
            background: rgba(0, 255, 255, 0.1);
            color: #00ffff;
            font-size: 7px;
            font-weight: bold;
            display: flex;
            align-items: center;
            user-select: none;
        `;
        intensityContainer.appendChild(intensityLabel);

        // Right side - button (clickable, changes color)
        const intensityButton = document.createElement('button');
        intensityButton.id = 'phone-camera-intensity';
        intensityButton.style.cssText = `
            padding: 4px 12px 4px 8px;
            background: rgba(0, 255, 100, 0.3);
            border: none;
            border-left: 1px solid rgba(0, 255, 255, 0.4);
            color: #00ff88;
            font-size: 7px;
            font-weight: bold;
            cursor: pointer;
            min-width: 45px;
            transition: all 0.2s ease;
        `;

        const intensityLevels = ['Low', 'Medium', 'High'];
        const intensityColors = {
            Low: { bg: 'rgba(100, 200, 255, 0.3)', color: '#64c8ff', text: 'Low' },
            Medium: { bg: 'rgba(0, 255, 100, 0.3)', color: '#00ff88', text: 'Med' },
            High: { bg: 'rgba(255, 100, 0, 0.4)', color: '#ff6400', text: 'High' },
        };

        let currentIntensityIndex = 1;
        const updateIntensityButton = () => {
            const level = intensityLevels[currentIntensityIndex];
            const style = intensityColors[level];
            intensityButton.textContent = style.text;
            intensityButton.style.background = style.bg;
            intensityButton.style.color = style.color;
        };
        updateIntensityButton();

        intensityButton.addEventListener('click', () => {
            if (this.systems?.cameraSettings) {
                currentIntensityIndex = (currentIntensityIndex + 1) % intensityLevels.length;
                const newIntensity = intensityLevels[currentIntensityIndex].toLowerCase();
                this.systems.cameraSettings.applyPreset(newIntensity);
                if (this.systems.cameraController) {
                    this.systems.cameraController.updateSettings();
                }
                updateIntensityButton();
            }
        });

        intensityContainer.appendChild(intensityButton);
        cameraSection.appendChild(intensityContainer);

        // Camera mode buttons
        const modeButtons = document.createElement('div');
        modeButtons.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2px;
        `;

        const modes = ['Reset', 'Normal', 'Intimate', 'Wide', 'Look Behind'];
        modes.forEach((mode) => {
            const btn = document.createElement('button');
            btn.textContent = mode.length > 6 ? mode.substring(0, 6) : mode; // Truncate long names
            btn.style.cssText = `
                padding: 2px;
                background: rgba(0, 255, 255, 0.15);
                border: 1px solid rgba(0, 255, 255, 0.4);
                border-radius: 2px;
                color: #00ffff;
                font-size: 5px;
                cursor: pointer;
            `;

            btn.addEventListener('click', () => {
                if (!this.systems?.cameraController) {
                    return;
                }

                switch (mode) {
                    case 'Reset':
                        if (this.systems.avatar) {
                            this.systems.cameraController.snapBehindAvatar(this.systems.avatar);
                        }
                        break;
                    case 'Normal':
                        this.systems.cameraController.setMode('follow');
                        this.systems.cameraController.setPreset('normal');
                        break;
                    case 'Intimate':
                        this.systems.cameraController.setPreset('intimate');
                        break;
                    case 'Wide':
                        this.systems.cameraController.setPreset('wide');
                        break;
                    case 'Look Behind': {
                        const current = this.systems.cameraController.isLookingBehind;
                        this.systems.cameraController.setLookBehind(!current);
                        break;
                    }
                }
            });

            modeButtons.appendChild(btn);
        });

        cameraSection.appendChild(modeButtons);
        this.tabContent.appendChild(cameraSection);

        // Fragment progress (compact)
        if (this.systems?.fragmentProgressionSystem) {
            const fragmentSection = document.createElement('div');
            fragmentSection.style.cssText = `
                margin-top: 4px;
                padding: 3px;
                background: rgba(255, 0, 255, 0.1);
                border-radius: 3px;
                border: 1px solid rgba(255, 0, 255, 0.3);
            `;

            const fragmentLabel = document.createElement('div');
            fragmentLabel.textContent = 'Frags: 0';
            fragmentLabel.id = 'phone-fragment-count';
            fragmentLabel.style.cssText = `
                color: #ff00ff;
                font-size: 6px;
            `;
            fragmentSection.appendChild(fragmentLabel);

            const fragmentBar = document.createElement('div');
            fragmentBar.style.cssText = `
                width: 100%;
                height: 2px;
                background: rgba(255, 0, 255, 0.2);
                border-radius: 1px;
                margin-top: 2px;
                overflow: hidden;
            `;

            const fragmentFill = document.createElement('div');
            fragmentFill.id = 'phone-fragment-fill';
            fragmentFill.style.cssText = `
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #ff00ff, #ff88ff);
                transition: width 0.3s ease;
            `;
            fragmentBar.appendChild(fragmentFill);
            fragmentSection.appendChild(fragmentBar);

            this.tabContent.appendChild(fragmentSection);
        }
    }

    createMapTab() {
        // Minimap/DiscoveryMap content
        const mapContainer = document.createElement('div');
        mapContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: rgba(0, 255, 255, 0.7);
            font-size: 6px;
            padding: 4px;
        `;

        // Check if we're in the club scene (after TV transition)
        const isInClubScene =
            this.systems?.clubScene &&
            (!this.systems?.tvTransitionSystem || !this.systems.tvTransitionSystem.isInProgress());

        // Check for discovery system (could be interactiveObjectDiscovery)
        const discoverySystem =
            this.systems?.discoverySystem || this.systems?.interactiveObjectDiscovery;

        if (isInClubScene && discoverySystem) {
            // Create minimap canvas (scaled down)
            const mapCanvas = document.createElement('canvas');
            mapCanvas.width = 120;
            mapCanvas.height = 150;
            mapCanvas.style.cssText = `
                width: 100%;
                height: auto;
                max-height: 120px;
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 2px;
                background: rgba(0, 0, 0, 0.5);
            `;

            const ctx = mapCanvas.getContext('2d');

            // Draw simple minimap
            ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
            ctx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);

            // Draw room bounds (simplified)
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(20, 20, mapCanvas.width - 40, mapCanvas.height - 40);

            // Draw player position (center)
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(mapCanvas.width / 2, mapCanvas.height / 2, 4, 0, Math.PI * 2);
            ctx.fill();

            // Draw discovered objects if available
            if (discoverySystem.getDiscoveredObjects) {
                const discovered = discoverySystem.getDiscoveredObjects();
                discovered.forEach((obj) => {
                    if (obj.position) {
                        // Map world position to canvas (simplified)
                        const x = (obj.position.x / 20) * (mapCanvas.width - 40) + 20;
                        const z = (obj.position.z / 20) * (mapCanvas.height - 40) + 20;
                        ctx.fillStyle = '#ffff00';
                        ctx.beginPath();
                        ctx.arc(x, z, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            }

            mapContainer.appendChild(mapCanvas);

            // Stats (scaled down)
            const statsDiv = document.createElement('div');
            statsDiv.style.cssText = `
                margin-top: 4px;
                padding: 3px;
                background: rgba(0, 255, 255, 0.1);
                border-radius: 2px;
                font-size: 5px;
                text-align: center;
            `;

            if (discoverySystem.getStats) {
                const stats = discoverySystem.getStats();
                statsDiv.innerHTML = `
                    <div>Found: ${stats.discoveredCount || 0}</div>
                `;
            } else {
                statsDiv.textContent = 'Map';
            }

            mapContainer.appendChild(statsDiv);
        } else if (!isInClubScene) {
            // Not in club scene yet (still in TV room)
            mapContainer.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 16px; margin-bottom: 4px;">🗺️</div>
                    <div style="font-size: 6px; opacity: 0.7;">
                        Enter the TV to see the map
                    </div>
                </div>
            `;
        } else {
            mapContainer.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 16px; margin-bottom: 4px;">🗺️</div>
                    <div style="font-size: 6px; opacity: 0.7;">
                        Map loading...
                    </div>
                </div>
            `;
        }

        this.tabContent.appendChild(mapContainer);
    }

    createAvatarTab() {
        const avatarContainer = document.createElement('div');
        avatarContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            height: 100%;
        `;

        // Top half: Avatar ring on left, nickname/join date on right
        const topHalf = document.createElement('div');
        topHalf.style.cssText = `
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            gap: 6px;
            padding: 6px 8px;
            min-height: 60px;
        `;

        // Left side: Smaller avatar ring
        const avatarRingContainer = document.createElement('div');
        avatarRingContainer.style.cssText = `
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        if (this.systems?.avatar) {
            const avatar = this.systems.avatar;
            const variantName = avatar.colorVariant || 'classic_purple';
            const variant = avatar.colorVariants?.[variantName] || { color: 0x8000ff, glow: 0.5 };

            // Convert hex to rgb for CSS
            const r = (variant.color >> 16) & 255;
            const g = (variant.color >> 8) & 255;
            const b = variant.color & 255;

            // Smaller avatar ring
            const avatarRing = document.createElement('div');
            avatarRing.style.cssText = `
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, 
                    rgba(${r}, ${g}, ${b}, 0.8), 
                    rgba(${r}, ${g}, ${b}, 0.4));
                border: 2px solid rgba(${r}, ${g}, ${b}, 1);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 
                    0 0 15px rgba(${r}, ${g}, ${b}, 0.6),
                    inset 0 0 15px rgba(${r}, ${g}, ${b}, 0.2);
            `;
            avatarRing.textContent = '👤';
            avatarRingContainer.appendChild(avatarRing);
        }

        // Right side: Nickname and join date
        const infoContainer = document.createElement('div');
        infoContainer.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            padding-top: 4px;
            min-width: 0; /* Allow text to wrap */
        `;

        // Get nickname from localStorage or default
        const nickname =
            typeof window !== 'undefined' && window.localStorage
                ? window.localStorage.getItem('errlPlayerNickname') || 'Player'
                : 'Player';

        // Get join date from localStorage or use current date
        let joinDate =
            typeof window !== 'undefined' && window.localStorage
                ? window.localStorage.getItem('errlPlayerJoinDate')
                : null;

        if (!joinDate) {
            // First time - set join date to today
            joinDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem('errlPlayerJoinDate', joinDate);
            }
        }

        // Format join date for display
        const joinDateObj = new Date(joinDate);
        const formattedJoinDate = joinDateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

        // Nickname display
        const nicknameDisplay = document.createElement('div');
        nicknameDisplay.id = 'phone-avatar-nickname';
        nicknameDisplay.textContent = nickname;
        nicknameDisplay.style.cssText = `
            font-size: 12px;
            font-weight: bold;
            color: #00ffff;
            text-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
            margin-bottom: 2px;
            word-break: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
        `;
        infoContainer.appendChild(nicknameDisplay);

        // Join date display
        const joinDateDisplay = document.createElement('div');
        joinDateDisplay.id = 'phone-avatar-join-date';
        joinDateDisplay.textContent = `Joined ${formattedJoinDate}`;
        joinDateDisplay.style.cssText = `
            font-size: 8px;
            color: rgba(255, 255, 255, 0.7);
            text-shadow: 0 0 4px rgba(0, 255, 255, 0.4);
        `;
        infoContainer.appendChild(joinDateDisplay);

        topHalf.appendChild(avatarRingContainer);
        topHalf.appendChild(infoContainer);
        avatarContainer.appendChild(topHalf);

        // Collection stats
        if (this.systems?.collectionTracker) {
            const stats = this.systems.collectionTracker.getStats();
            const breakdown = this.systems.collectionTracker.getBreakdown();

            const statsSection = document.createElement('div');
            statsSection.style.cssText = `
                margin-top: 8px;
                padding: 8px;
                background: rgba(0, 255, 255, 0.1);
                border-radius: 8px;
                border: 1px solid rgba(0, 255, 255, 0.3);
            `;

            const statsTitle = document.createElement('div');
            statsTitle.textContent = 'Collection Stats';
            statsTitle.style.cssText = `
                color: #00ffff;
                font-size: 10px;
                font-weight: bold;
                margin-bottom: 6px;
            `;
            statsSection.appendChild(statsTitle);

            const statRows = [
                { label: 'Fragments', value: breakdown.session.fragments, color: '#ff00ff' },
                { label: 'Drips', value: breakdown.session.drips, color: '#00ffff' },
                { label: 'Bubbles', value: breakdown.session.bubbles, color: '#ffff00' },
                { label: 'Glow Balls', value: breakdown.session.glowBalls, color: '#00ff00' },
            ];

            statRows.forEach((stat) => {
                const row = document.createElement('div');
                row.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    font-size: 9px;
                    margin-bottom: 4px;
                `;

                const label = document.createElement('span');
                label.textContent = stat.label;
                label.style.color = 'rgba(255, 255, 255, 0.7)';

                const value = document.createElement('span');
                value.textContent = stat.value.toLocaleString();
                value.style.color = stat.color;
                value.style.fontWeight = 'bold';

                row.appendChild(label);
                row.appendChild(value);
                statsSection.appendChild(row);
            });

            avatarContainer.appendChild(statsSection);
        }

        this.tabContent.appendChild(avatarContainer);
    }

    createVibeTab() {
        const vibeContainer = document.createElement('div');
        vibeContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 12px;
        `;

        if (this.systems?.vibeMeter) {
            // Vibe meter visual
            const vibeMeter = this.systems.vibeMeter;
            const currentVibe = vibeMeter.getCurrentVibe() || 0;

            // Vibe level display (scaled down)
            const vibeLevel = document.createElement('div');
            vibeLevel.style.cssText = `
                font-size: 18px;
                font-weight: bold;
                color: #00ffff;
                text-shadow: 0 0 5px rgba(0, 255, 255, 0.8);
            `;
            vibeLevel.textContent = `${Math.round(currentVibe * 100)}%`;
            vibeContainer.appendChild(vibeLevel);

            // Vibe bar (scaled down)
            const vibeBar = document.createElement('div');
            vibeBar.style.cssText = `
                width: 100px;
                height: 10px;
                background: rgba(0, 255, 255, 0.2);
                border: 1px solid #00ffff;
                border-radius: 5px;
                overflow: hidden;
                position: relative;
            `;

            const vibeFill = document.createElement('div');
            vibeFill.id = 'phone-vibe-fill';
            vibeFill.style.cssText = `
                height: 100%;
                width: ${currentVibe * 100}%;
                background: linear-gradient(90deg, #00ffff, #ff00ff);
                transition: width 0.3s ease;
                box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
            `;
            vibeBar.appendChild(vibeFill);
            vibeContainer.appendChild(vibeBar);

            // Milestone info (scaled down)
            const milestoneInfo = document.createElement('div');
            milestoneInfo.style.cssText = `
                font-size: 5px;
                color: rgba(0, 255, 255, 0.7);
                text-align: center;
                margin-top: 4px;
            `;
            milestoneInfo.textContent = 'Dance to vibe!';
            vibeContainer.appendChild(milestoneInfo);
        } else {
            vibeContainer.innerHTML = `
                <div style="text-align: center; color: rgba(0, 255, 255, 0.7);">
                    <div style="font-size: 16px; margin-bottom: 4px;">✨</div>
                    <div style="font-size: 6px;">Vibe</div>
                    <div style="font-size: 5px; margin-top: 4px; opacity: 0.7;">
                        Not available
                    </div>
                </div>
            `;
        }

        this.tabContent.appendChild(vibeContainer);
    }

    createInventoryTab() {
        const inventoryContainer = document.createElement('div');
        inventoryContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;

        // Inventory slots section
        const slotsSection = document.createElement('div');
        slotsSection.style.cssText = `
            margin-bottom: 8px;
        `;

        const slotsTitle = document.createElement('div');
        slotsTitle.textContent = 'Items';
        slotsTitle.style.cssText = `
            color: #00ffff;
            font-size: 6px;
            font-weight: bold;
            margin-bottom: 4px;
        `;
        slotsSection.appendChild(slotsTitle);

        const slotsGrid = document.createElement('div');
        slotsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 3px;
        `;

        // Slot 1: Clothing/Hat (future feature)
        const slot1 = this.createInventorySlot(1, 'clothing', 'Coming Soon');
        slotsGrid.appendChild(slot1);

        // Slot 2: Rare collectible
        const slot2 = this.createInventorySlot(2, 'rare', null);
        // Check if player has rare collectible
        if (this.systems?.rareCollectibleTracker) {
            const rareCollectibles = this.systems.rareCollectibleTracker.getRareCollectibles();
            // Find first rare collectible
            const rareEntry = Object.values(rareCollectibles).find((r) => r !== null);
            if (rareEntry) {
                slot2.innerHTML = '';
                const icon = document.createElement('div');
                icon.textContent = '✨';
                icon.style.cssText = 'font-size: 24px; margin-bottom: 4px;';
                slot2.appendChild(icon);

                const name = document.createElement('div');
                name.textContent = rareEntry.name;
                name.style.cssText = `
                    color: #00ffff;
                    font-size: 9px;
                    text-align: center;
                `;
                slot2.appendChild(name);
            }
        }
        slotsGrid.appendChild(slot2);

        // Slot 3: Special item
        const slot3 = this.createInventorySlot(3, 'special', null);
        slotsGrid.appendChild(slot3);

        slotsSection.appendChild(slotsGrid);
        inventoryContainer.appendChild(slotsSection);

        // Achievements section
        const achievementsSection = document.createElement('div');
        achievementsSection.style.cssText = `
            margin-top: 8px;
        `;

        const achievementsTitle = document.createElement('div');
        achievementsTitle.textContent = 'Achievements';
        achievementsTitle.style.cssText = `
            color: #00ffff;
            font-size: 6px;
            font-weight: bold;
            margin-bottom: 4px;
        `;
        achievementsSection.appendChild(achievementsTitle);

        const achievementsList = document.createElement('div');
        achievementsList.id = 'phone-achievements-list';
        achievementsList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 2px;
            max-height: 100px;
            overflow-y: auto;
        `;

        // Populate achievements
        if (this.systems?.achievementSystem) {
            this.populateAchievements(achievementsList);
        } else {
            const noAchievements = document.createElement('div');
            noAchievements.textContent = 'No achievements available';
            noAchievements.style.cssText = `
                color: rgba(255, 255, 255, 0.4);
                font-size: 9px;
                text-align: center;
                padding: 20px;
            `;
            achievementsList.appendChild(noAchievements);
        }

        achievementsSection.appendChild(achievementsList);
        inventoryContainer.appendChild(achievementsSection);

        this.tabContent.appendChild(inventoryContainer);
    }

    createMusicTab() {
        const musicContainer = document.createElement('div');
        musicContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 4px;
        `;

        // Title
        const title = document.createElement('div');
        title.textContent = '🎵 Music Player';
        title.style.cssText = `
            color: #00ffff;
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 4px;
        `;
        musicContainer.appendChild(title);

        // Track name display
        const trackName = document.createElement('div');
        trackName.id = 'phone-track-name';
        trackName.textContent = 'No track loaded';
        trackName.style.cssText = `
            color: #fff;
            font-size: 8px;
            text-align: center;
            padding: 4px;
            background: rgba(0, 255, 255, 0.1);
            border-radius: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        musicContainer.appendChild(trackName);

        // File input for loading tracks
        const fileInputContainer = document.createElement('div');
        fileInputContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 4px;
        `;

        const fileLabel = document.createElement('label');
        fileLabel.textContent = 'Load Audio';
        fileLabel.style.cssText = `
            color: rgba(255, 255, 255, 0.7);
            font-size: 7px;
        `;
        fileInputContainer.appendChild(fileLabel);

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'audio/*';
        fileInput.style.cssText = `
            font-size: 7px;
            color: #00ffff;
            width: 100%;
        `;
        fileInput.addEventListener('change', (e) => this.handleMusicFileSelect(e));
        fileInputContainer.appendChild(fileInput);

        musicContainer.appendChild(fileInputContainer);

        // Playback controls
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 8px;
        `;

        const prevBtn = this.createMusicButton('⏮️', () => this.musicPrev());
        const playBtn = this.createMusicButton('▶️', () => this.musicTogglePlay());
        playBtn.id = 'phone-music-play-btn';
        const nextBtn = this.createMusicButton('⏭️', () => this.musicNext());

        controls.appendChild(prevBtn);
        controls.appendChild(playBtn);
        controls.appendChild(nextBtn);
        musicContainer.appendChild(controls);

        // Volume control
        const volumeContainer = document.createElement('div');
        volumeContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 4px;
        `;

        const volumeLabel = document.createElement('span');
        volumeLabel.textContent = '🔊';
        volumeLabel.style.cssText = 'font-size: 10px;';
        volumeContainer.appendChild(volumeLabel);

        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '100';
        volumeSlider.value = '80';
        volumeSlider.style.cssText = `
            flex: 1;
            height: 4px;
            cursor: pointer;
        `;
        volumeSlider.addEventListener('input', (e) => this.setMusicVolume(e.target.value / 100));
        volumeContainer.appendChild(volumeSlider);

        musicContainer.appendChild(volumeContainer);

        // Progress bar
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
            margin-top: 4px;
        `;

        const progressBar = document.createElement('div');
        progressBar.id = 'phone-music-progress';
        progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #00ffff, #ff00ff);
            transition: width 0.1s ease;
        `;
        progressContainer.appendChild(progressBar);
        musicContainer.appendChild(progressContainer);

        // Visualizer preview (simple bars)
        const visualizer = document.createElement('div');
        visualizer.id = 'phone-music-visualizer';
        visualizer.style.cssText = `
            display: flex;
            justify-content: space-around;
            align-items: flex-end;
            height: 30px;
            margin-top: 8px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            padding: 4px;
        `;

        // Create 8 visualizer bars
        for (let i = 0; i < 8; i++) {
            const bar = document.createElement('div');
            bar.className = 'phone-viz-bar';
            bar.style.cssText = `
                width: 8px;
                height: ${10 + Math.random() * 15}px;
                background: linear-gradient(to top, #00ffff, #ff00ff);
                border-radius: 2px;
                transition: height 0.1s ease;
            `;
            visualizer.appendChild(bar);
        }
        musicContainer.appendChild(visualizer);

        this.tabContent.appendChild(musicContainer);

        // Start visualizer animation
        this.startMusicVisualizer();
    }

    createMusicButton(icon, onClick) {
        const btn = document.createElement('button');
        btn.innerHTML = icon;
        btn.style.cssText = `
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 1px solid #00ffff;
            background: rgba(0, 255, 255, 0.1);
            color: #00ffff;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(0, 255, 255, 0.3)';
            btn.style.transform = 'scale(1.1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'rgba(0, 255, 255, 0.1)';
            btn.style.transform = 'scale(1)';
        });
        btn.addEventListener('click', onClick);
        return btn;
    }

    handleMusicFileSelect(event) {
        const file = event.target.files[0];
        if (file && this.systems?.audioPlayer) {
            // Use the audioPlayer from systems
            this.systems.audioPlayer.handleFileSelect(event);
            const trackNameEl = document.getElementById('phone-track-name');
            if (trackNameEl) {
                trackNameEl.textContent = file.name;
            }
        } else if (file) {
            // Fallback: create audio element directly
            if (this.musicAudio) {
                this.musicAudio.pause();
            }
            this.musicAudio = new Audio(URL.createObjectURL(file));
            this.musicAudio.volume = 0.8;
            const trackNameEl = document.getElementById('phone-track-name');
            if (trackNameEl) {
                trackNameEl.textContent = file.name;
            }
        }
    }

    musicTogglePlay() {
        const playBtn = document.getElementById('phone-music-play-btn');
        if (this.systems?.audioPlayer) {
            this.systems.audioPlayer.togglePlay?.();
            if (playBtn) {
                playBtn.innerHTML = this.systems.audioPlayer.isPlaying ? '⏸️' : '▶️';
            }
        } else if (this.musicAudio) {
            if (this.musicAudio.paused) {
                this.musicAudio.play();
                if (playBtn) {
                    playBtn.innerHTML = '⏸️';
                }
            } else {
                this.musicAudio.pause();
                if (playBtn) {
                    playBtn.innerHTML = '▶️';
                }
            }
        }
    }

    musicPrev() {
        if (this.systems?.audioPlayer?.prevTrack) {
            this.systems.audioPlayer.prevTrack();
        }
    }

    musicNext() {
        if (this.systems?.audioPlayer?.nextTrack) {
            this.systems.audioPlayer.nextTrack();
        }
    }

    setMusicVolume(value) {
        if (this.systems?.audioPlayer) {
            // Assuming audioPlayer has a setVolume method or audio element
            if (this.systems.audioPlayer.audioElement) {
                this.systems.audioPlayer.audioElement.volume = value;
            }
        } else if (this.musicAudio) {
            this.musicAudio.volume = value;
        }
    }

    startMusicVisualizer() {
        // Simple fake visualizer animation
        this.musicVisualizerInterval = setInterval(() => {
            const bars = document.querySelectorAll('.phone-viz-bar');
            bars.forEach((bar) => {
                const height = 5 + Math.random() * 20;
                bar.style.height = `${height}px`;
            });
        }, 100);
    }

    stopMusicVisualizer() {
        if (this.musicVisualizerInterval) {
            clearInterval(this.musicVisualizerInterval);
            this.musicVisualizerInterval = null;
        }
    }

    createInventorySlot(slotNumber, type, placeholderText) {
        const slot = document.createElement('div');
        slot.id = `phone-inventory-slot-${slotNumber}`;
        slot.style.cssText = `
            aspect-ratio: 1;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 3px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4px;
            position: relative;
        `;

        if (placeholderText) {
            const placeholder = document.createElement('div');
            placeholder.textContent =
                placeholderText.length > 8 ? placeholderText.substring(0, 8) : placeholderText;
            placeholder.style.cssText = `
                color: rgba(255, 255, 255, 0.4);
                font-size: 4px;
                text-align: center;
            `;
            slot.appendChild(placeholder);
        } else {
            const emptyText = document.createElement('div');
            emptyText.textContent = 'Empty';
            emptyText.style.cssText = `
                color: rgba(255, 255, 255, 0.3);
                font-size: 5px;
            `;
            slot.appendChild(emptyText);
        }

        // Store slot type for later updates
        slot.dataset.slotType = type;
        slot.dataset.slotNumber = slotNumber;

        return slot;
    }

    populateAchievements(container) {
        if (!this.systems?.achievementSystem) {
            return;
        }

        // Get achievements - check if method exists
        let achievements = [];
        let unlocked = new Set();

        if (typeof this.systems.achievementSystem.getAchievements === 'function') {
            achievements = this.systems.achievementSystem.getAchievements();
        } else if (this.systems.achievementSystem.achievements) {
            achievements = this.systems.achievementSystem.achievements;
        }

        // Get unlocked achievements - use the Set directly, not the array from getUnlockedAchievements()
        if (this.systems.achievementSystem.unlockedAchievements) {
            unlocked = this.systems.achievementSystem.unlockedAchievements;
        } else if (typeof this.systems.achievementSystem.getUnlockedAchievements === 'function') {
            // If we get an array, convert to Set of IDs
            const unlockedArray = this.systems.achievementSystem.getUnlockedAchievements();
            unlocked = new Set(unlockedArray.map((a) => a.id || a));
        }

        achievements.forEach((achievement) => {
            const achievementItem = document.createElement('div');
            achievementItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 3px;
                padding: 2px;
                background: rgba(0, 255, 255, 0.05);
                border-radius: 2px;
                font-size: 5px;
            `;

            const isUnlocked = unlocked.has(achievement.id);

            const icon = document.createElement('span');
            icon.textContent = isUnlocked ? achievement.icon || '✨' : '???';
            icon.style.cssText = `
                font-size: 8px;
                opacity: ${isUnlocked ? '1' : '0.5'};
            `;
            achievementItem.appendChild(icon);

            const text = document.createElement('span');
            const desc = isUnlocked ? achievement.description : '???';
            text.textContent = desc.length > 15 ? desc.substring(0, 15) + '...' : desc;
            text.style.cssText = `
                color: ${isUnlocked ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)'};
                flex: 1;
            `;
            achievementItem.appendChild(text);

            container.appendChild(achievementItem);
        });
    }

    createCollapsibleSection(title, keybinds) {
        const section = document.createElement('div');
        section.style.cssText = `
            width: 100%;
            margin-bottom: 1px;
            background: rgba(0, 255, 255, 0.05);
            border: 1px solid rgba(0, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
            box-sizing: border-box;
        `;

        const header = document.createElement('div');
        header.textContent = title; // Show full title now
        header.style.cssText = `
            padding: 4px 6px;
            color: #00ffff;
            font-size: 8px;
            font-weight: bold;
            letter-spacing: 0.5px;
            cursor: pointer;
            user-select: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-transform: uppercase;
        `;

        const arrow = document.createElement('span');
        arrow.textContent = '▼';
        arrow.style.cssText = 'font-size: 5px; transition: transform 0.2s ease;';
        header.appendChild(arrow);

        const content = document.createElement('div');
        content.style.cssText = `
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        `;

        const inner = document.createElement('div');
        inner.style.cssText = `
            padding: 2px 4px;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 1px;
        `;

        if (keybinds.length === 0) {
            const noKeybind = document.createElement('div');
            noKeybind.textContent = 'None';
            noKeybind.style.cssText = 'color: rgba(255, 255, 255, 0.4); font-size: 5px;';
            inner.appendChild(noKeybind);
        } else {
            // Group keybinds by description to show multiple keys in one row
            const grouped = new Map();
            keybinds.forEach((keybind) => {
                const desc = keybind.description || '';
                if (!grouped.has(desc)) {
                    grouped.set(desc, []);
                }
                grouped.get(desc).push(keybind);
            });

            grouped.forEach((keybindsForDesc, desc) => {
                const row = document.createElement('div');
                row.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 6px;
                    width: 100%;
                `;

                // Show all keys for this description in one span
                const keys = keybindsForDesc
                    .map((k) => this.formatKeybind(k.key, k.modifiers))
                    .join(' ');
                const key = document.createElement('span');
                key.textContent = keys;
                key.style.cssText =
                    'color: #00ff99; font-family: monospace; font-weight: bold; font-size: 6px; flex-shrink: 0; white-space: nowrap;';

                const descEl = document.createElement('span');
                descEl.textContent = desc;
                descEl.style.cssText =
                    'color: rgba(255, 255, 255, 0.7); text-align: right; flex: 1 1 auto; font-size: 6px; white-space: nowrap; overflow: visible;';

                row.appendChild(key);
                row.appendChild(descEl);
                inner.appendChild(row);
            });
        }

        content.appendChild(inner);
        section.appendChild(header);
        section.appendChild(content);

        let isOpen = false;
        header.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                content.style.maxHeight = content.scrollHeight + 'px';
                arrow.style.transform = 'rotate(180deg)';
            } else {
                content.style.maxHeight = '0';
                arrow.style.transform = 'rotate(0deg)';
            }
        });

        return section;
    }

    /**
     * Create an effect toggle button
     */
    createEffectToggle(label, effectKey, container) {
        const toggle = document.createElement('button');
        toggle.textContent = label;
        toggle.style.cssText = `
            width: 100%;
            padding: 3px;
            margin-bottom: 2px;
            background: rgba(0, 255, 255, 0.15);
            border: 1px solid rgba(0, 255, 255, 0.4);
            border-radius: 2px;
            color: #00ffff;
            font-size: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        const updateToggle = () => {
            if (this.systems?.visualEffectSettings) {
                const intensity =
                    this.systems.visualEffectSettings.getSetting(effectKey + 'Intensity') || 0;
                const isActive = intensity > 0;
                toggle.style.background = isActive
                    ? 'rgba(0, 255, 255, 0.4)'
                    : 'rgba(0, 255, 255, 0.15)';
                toggle.style.color = isActive ? '#ffffff' : '#00ffff';
            }
        };
        updateToggle();

        toggle.addEventListener('click', () => {
            if (this.systems?.visualEffectSettings) {
                const current =
                    this.systems.visualEffectSettings.getSetting(effectKey + 'Intensity') || 0;
                const newValue = current > 0 ? 0 : 0.5; // Toggle between off and medium
                this.systems.visualEffectSettings.setSetting(effectKey + 'Intensity', newValue);

                // Apply to visual effects
                if (this.systems.visualEffects && effectKey === 'uvMode') {
                    this.systems.visualEffects.setUVMode(newValue > 0);
                }
                if (this.systems.postProcessingManager && effectKey === 'glitch') {
                    this.systems.postProcessingManager.setGlitchEnabled(newValue > 0);
                    if (this.systems.postProcessingManager.glitchPass) {
                        this.systems.postProcessingManager.glitchPass.material.uniforms.intensity.value =
                            newValue;
                    }
                }

                updateToggle();
            }
        });

        return toggle;
    }

    /**
     * Create an effect slider control
     */
    createEffectSlider(label, settingKey, container) {
        const sliderContainer = document.createElement('div');
        sliderContainer.style.cssText = `
            width: 100%;
            margin-bottom: 2px;
            display: flex;
            align-items: center;
            gap: 4px;
            box-sizing: border-box;
        `;

        const labelEl = document.createElement('div');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            font-size: 6px;
            color: rgba(0, 255, 255, 0.8);
            flex-shrink: 0;
            white-space: nowrap;
        `;
        sliderContainer.appendChild(labelEl);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = '50';
        slider.style.cssText = `
            flex: 1;
            min-width: 0;
            max-width: 100%;
            height: 3px;
            box-sizing: border-box;
        `;

        const valueDisplay = document.createElement('div');
        valueDisplay.style.cssText = `
            font-size: 6px;
            color: #00ffff;
            flex-shrink: 0;
            flex-grow: 0;
            text-align: right;
            white-space: nowrap;
            overflow: visible;
        `;

        const updateSlider = () => {
            if (this.systems?.visualEffectSettings) {
                const value = this.systems.visualEffectSettings.getSetting(settingKey) || 0;
                slider.value = (value * 100).toString();
                valueDisplay.textContent = `${Math.round(value * 100)}%`;
            }
        };
        updateSlider();

        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value) / 100;
            if (this.systems?.visualEffectSettings) {
                this.systems.visualEffectSettings.setSetting(settingKey, value);
                valueDisplay.textContent = `${Math.round(value * 100)}%`;
            }
        });

        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(valueDisplay);
        return sliderContainer;
    }

    formatKeybind(key, modifiers) {
        const parts = [];
        if (modifiers.shift) {
            parts.push('Shift');
        }
        if (modifiers.ctrl) {
            parts.push('Ctrl');
        }
        if (modifiers.alt) {
            parts.push('Alt');
        }
        let keyStr = key.toUpperCase();
        if (key === ' ') {
            keyStr = 'Space';
        }
        if (key === 'tab') {
            keyStr = 'Tab';
        }
        if (key === 'arrowup') {
            keyStr = '↑';
        }
        if (key === 'arrowdown') {
            keyStr = '↓';
        }
        if (key === 'arrowleft') {
            keyStr = '←';
        }
        if (key === 'arrowright') {
            keyStr = '→';
        }
        parts.push(keyStr);
        return parts.join('+');
    }

    getMovementKeybinds() {
        if (!this.keybindManager) {
            return [];
        }
        const all = this.keybindManager.getAllKeybinds();
        return all.filter((k) => {
            const desc = (k.description || '').toLowerCase();
            return (
                desc.includes('move') ||
                desc.includes('camera') ||
                desc.includes('hop') ||
                desc.includes('jump') ||
                desc.includes('run') ||
                desc.includes('crouch') ||
                desc.includes('dash') ||
                desc.includes('preset') ||
                desc.includes('snap') ||
                desc.includes('cinematic') ||
                desc.includes('freecam') ||
                desc.includes('look behind')
            );
        });
    }

    getInteractionKeybinds() {
        if (!this.keybindManager) {
            return [];
        }
        const all = this.keybindManager.getAllKeybinds();
        return all.filter((k) => {
            const desc = (k.description || '').toLowerCase();
            return (
                desc.includes('interact') ||
                desc.includes('effect') ||
                desc.includes('collect') ||
                desc.includes('throw') ||
                desc.includes('emote') ||
                desc.includes('dance') ||
                desc.includes('pickup') ||
                desc.includes('drop') ||
                desc.includes('use') ||
                desc.includes('action')
            );
        });
    }

    getSettingsKeybinds() {
        if (!this.keybindManager) {
            return [];
        }
        const all = this.keybindManager.getAllKeybinds();
        return all.filter((k) => {
            const desc = (k.description || '').toLowerCase();
            return (
                desc.includes('setting') ||
                desc.includes('menu') ||
                desc.includes('ui') ||
                desc.includes('help') ||
                desc.includes('tutorial') ||
                desc.includes('panel') ||
                desc.includes('preference') ||
                desc.includes('config') ||
                desc.includes('option') ||
                desc.includes('toggle')
            );
        });
    }

    /**
     * Setup click-outside handler to minimize phone
     */
    setupOutsideClickHandler() {
        // Remove existing handler if any
        if (this.outsideClickHandler) {
            document.removeEventListener('click', this.outsideClickHandler);
            document.removeEventListener('mousedown', this.outsideClickHandler, true);
        }

        // Create new handler using mousedown for better reliability
        this.outsideClickHandler = (e) => {
            // Only minimize if phone is expanded
            if (this.isCollapsed) {
                return;
            }

            // Check if click is outside the phone
            if (this.phoneElement && !this.phoneElement.contains(e.target)) {
                this.toggleCollapse();
            }
        };

        // Add handler with a slight delay to avoid immediate triggering
        setTimeout(() => {
            document.addEventListener('mousedown', this.outsideClickHandler, true);
        }, 100);
    }

    update() {
        // Update points display
        if (this.systems?.collectionTracker) {
            const pointsValue = document.getElementById('phone-points-value');
            if (pointsValue) {
                const stats = this.systems.collectionTracker.getStats();
                const totalPoints =
                    (stats.session.drips || 0) +
                    (stats.session.bubbles || 0) +
                    (stats.session.fragments || 0) +
                    (stats.session.glowBalls || 0);
                pointsValue.textContent = totalPoints.toLocaleString();
            }
        }

        // Update dynamic content based on current tab
        // Update thin vibe bar at top (always visible when expanded)
        if (this.systems?.vibeMeter && !this.isCollapsed && this.vibeBarContainer) {
            const currentVibe = this.systems.vibeMeter.getCurrentVibe() || 0;
            this.vibeBarContainer.style.width = `${currentVibe * 100}%`;
        }

        if (this.currentTab === 'avatar' && this.systems?.collectionTracker) {
            // Update collection stats - refresh the tab content periodically
            // This will be handled by recreating the tab when needed
        }

        if (this.currentTab === 'menu' && this.systems?.fragmentProgressionSystem) {
            const fragmentCount = document.getElementById('phone-fragment-count');
            const fragmentFill = document.getElementById('phone-fragment-fill');
            if (fragmentCount && this.systems.fragmentProgressionSystem) {
                const fragmentCountValue =
                    this.systems.fragmentProgressionSystem.getFragmentCount() || 0;
                fragmentCount.textContent = `Fragments: ${fragmentCountValue}`;

                if (fragmentFill) {
                    // Update progress bar (assuming max fragments or progress percentage)
                    const progress = this.systems.fragmentProgressionSystem.getProgress
                        ? this.systems.fragmentProgressionSystem.getProgress()
                        : 0;
                    fragmentFill.style.width = `${progress * 100}%`;
                }
            }
        }

        if (this.currentTab === 'map') {
            // Redraw map periodically
            const mapCanvas = this.tabContent.querySelector('canvas');
            if (mapCanvas && this.systems) {
                this.updateMapCanvas(mapCanvas);
            }
        }

        if (this.currentTab === 'inventory') {
            // Update inventory display if needed
            // Rare collectibles and achievements will update via events
        }
    }

    updateMapCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const discoverySystem =
            this.systems?.discoverySystem || this.systems?.interactiveObjectDiscovery;

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw room bounds
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Draw player position (center)
        if (this.systems?.avatar && this.systems.avatar.position) {
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw discovered objects
        if (discoverySystem && discoverySystem.getDiscoveredObjects) {
            const discovered = discoverySystem.getDiscoveredObjects();
            discovered.forEach((obj) => {
                if (obj.position) {
                    // Map world position to canvas (simplified - assumes 20x20 room)
                    const x = ((obj.position.x + 10) / 20) * (canvas.width - 40) + 20;
                    const z = ((obj.position.z + 10) / 20) * (canvas.height - 40) + 20;
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.arc(x, z, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
    }

    show() {
        if (this.phoneElement) {
            this.phoneElement.style.display = 'flex';
        }
    }

    hide() {
        if (this.phoneElement) {
            this.phoneElement.style.display = 'none';
        }
    }

    toggle() {
        if (this.phoneElement) {
            if (this.phoneElement.style.display === 'none') {
                this.show();
            } else {
                this.hide();
            }
        }
    }
}
