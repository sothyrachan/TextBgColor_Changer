// Draw.io Plugin: Line Text Background Editor
// This plugin allows users to customize text background colors for all line elements

Draw.loadPlugin(function(ui) {
    // Plugin metadata
    const PLUGIN_NAME = 'Text Background Color Changer Plugin';
    const PLUGIN_VERSION = '1.0.0';
    
    // Add menu item to Tools menu
    ui.menus.get('tools').addSeparator();
    ui.menus.get('tools').addItem(PLUGIN_NAME, function() {
        showTextBackgroundDialog(ui);
    });
    
    // Function to show the color picker dialog
    function showTextBackgroundDialog(ui) {
        const graph = ui.editor.graph;
        const model = graph.getModel();
        
        // Create dialog content
        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.minWidth = '300px';
        
        // Title
        const title = document.createElement('h3');
        title.textContent = 'Customize Line Text Backgrounds';
        title.style.marginTop = '0';
        container.appendChild(title);
        
        // Color picker section
        const colorSection = document.createElement('div');
        colorSection.style.marginBottom = '20px';
        
        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Select background color: ';
        colorLabel.style.display = 'block';
        colorLabel.style.marginBottom = '10px';
        colorSection.appendChild(colorLabel);
        
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = '#FFFF00'; // Default yellow
        colorPicker.style.width = '50px';
        colorPicker.style.height = '30px';
        colorPicker.style.marginRight = '10px';
        colorSection.appendChild(colorPicker);
        
        const colorDisplay = document.createElement('span');
        colorDisplay.textContent = colorPicker.value;
        colorDisplay.style.padding = '5px 10px';
        colorDisplay.style.backgroundColor = colorPicker.value;
        colorDisplay.style.border = '1px solid #ccc';
        colorDisplay.style.borderRadius = '3px';
        colorSection.appendChild(colorDisplay);
        
        // Update color display when picker changes
        colorPicker.addEventListener('change', function() {
            colorDisplay.textContent = this.value;
            colorDisplay.style.backgroundColor = this.value;
        });
        
        container.appendChild(colorSection);
        
        // Options section
        const optionsSection = document.createElement('div');
        optionsSection.style.marginBottom = '20px';
        
        const transparencyCheckbox = document.createElement('input');
        transparencyCheckbox.type = 'checkbox';
        transparencyCheckbox.id = 'transparency-check';
        transparencyCheckbox.style.marginRight = '8px';
        
        const transparencyLabel = document.createElement('label');
        transparencyLabel.htmlFor = 'transparency-check';
        transparencyLabel.textContent = 'Remove background (transparent)';
        
        optionsSection.appendChild(transparencyCheckbox);
        optionsSection.appendChild(transparencyLabel);
        container.appendChild(optionsSection);
        
        // Statistics section
        const statsSection = document.createElement('div');
        statsSection.style.marginBottom = '15px';
        statsSection.style.padding = '10px';
        statsSection.style.backgroundColor = '#f5f5f5';
        statsSection.style.borderRadius = '3px';
        
        const lineCount = getLineElementsWithText(graph).length;
        const statsText = document.createElement('p');
        statsText.textContent = `Found ${lineCount} line element(s) with text that can be modified.`;
        statsText.style.margin = '0';
        statsSection.appendChild(statsText);
        container.appendChild(statsSection);
        
        // Create and show dialog
        const dlg = new mxDialog(container, 400, 250, true, true);
        dlg.ok = function() {
            const selectedColor = transparencyCheckbox.checked ? 'none' : colorPicker.value;
            applyTextBackgroundToLines(ui, selectedColor);
            dlg.hide();
        };
        
        dlg.cancel = function() {
            dlg.hide();
        };
        
        ui.showDialog(dlg.container, 400, 300, true, true);
        dlg.init();
    }
    
    // Function to find all line elements with text
    function getLineElementsWithText(graph) {
        const model = graph.getModel();
        const cells = model.cells;
        const lineElements = [];
        
        for (let id in cells) {
            const cell = cells[id];
            if (cell && cell.edge && cell.value && 
                (typeof cell.value === 'string' && cell.value.trim() !== '' || 
                 (cell.value && cell.value.nodeType && cell.value.textContent && cell.value.textContent.trim() !== ''))) {
                lineElements.push(cell);
            }
        }
        
        return lineElements;
    }
    
    // Function to apply background color to all line text elements
    function applyTextBackgroundToLines(ui, backgroundColor) {
        const graph = ui.editor.graph;
        const model = graph.getModel();
        const lineElements = getLineElementsWithText(graph);
        
        if (lineElements.length === 0) {
            ui.alert('No line elements with text found in the diagram.');
            return;
        }
        
        // Begin model update
        model.beginUpdate();
        
        try {
            let updatedCount = 0;
            
            lineElements.forEach(function(cell) {
                // Get current style
                let style = cell.getStyle() || '';
                
                // Remove existing labelBackgroundColor if present
                style = style.replace(/labelBackgroundColor=[^;]*;?/g, '');
                
                // Add new background color (if not transparent)
                if (backgroundColor !== 'none') {
                    style += (style.endsWith(';') ? '' : ';') + 'labelBackgroundColor=' + backgroundColor;
                }
                
                // Clean up any double semicolons
                style = style.replace(/;;+/g, ';').replace(/^;|;$/g, '');
                
                // Apply the updated style
                model.setStyle(cell, style);
                updatedCount++;
            });
            
            // Show success message
            const message = backgroundColor === 'none' 
                ? `Removed background from ${updatedCount} line text element(s).`
                : `Applied background color ${backgroundColor} to ${updatedCount} line text element(s).`;
            
            ui.alert(message);
            
        } finally {
            // End model update
            model.endUpdate();
        }
        
        // Refresh the view
        graph.refresh();
    }
    
    // Add keyboard shortcut (Ctrl+Shift+B)
    ui.keyHandler.bindKey(66, function(evt) {
        if (mxEvent.isControlDown(evt) && mxEvent.isShiftDown(evt)) {
            showTextBackgroundDialog(ui);
            mxEvent.consume(evt);
        }
    });
    
    console.log(`${PLUGIN_NAME} v${PLUGIN_VERSION} loaded successfully`);
});