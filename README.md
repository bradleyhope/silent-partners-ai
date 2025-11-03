# Silent Partners - Lombardi-style Network Visualizer

A web-based network visualization tool inspired by the work of Mark Lombardi, designed to reveal hidden connections between entities in complex networks.

## Features

- **Interactive Network Visualization**: Create and explore network diagrams with curved connections in the style of Mark Lombardi
- **Multiple Entity Types**: Support for persons, corporations, government entities, financial institutions, and organizations
- **Relationship Management**: Add and manage relationships between entities with different statuses (confirmed, suspected, former)
- **Dynamic Layouts**: Choose from force-directed, circular, radial, and timeline layouts
- **Export Capabilities**: Generate high-resolution artwork in multiple formats (Instagram, Twitter/Web, High Resolution Print)
- **Example Networks**: Pre-loaded example networks for demonstration
- **Data Import/Export**: Save and load network data in JSON format
- **Local Storage**: Save your work in browser storage

## Getting Started

1. Open `index.html` in a modern web browser
2. Use the control panel to add entities and relationships
3. Explore different layouts and visualization options
4. Export your network as artwork or data

## Example Networks

The application includes several example networks:
- Trump Family Network
- 1MDB Scandal
- BCCI Network
- Epstein Network
- Boulos Network

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: D3.js v7
- **Design**: Responsive CSS with Lombardi-inspired styling

## File Structure

```
silent_partners/
├── index.html              # Main HTML file
├── styles.css              # Stylesheet with Lombardi-inspired design
├── lombardi-visualizer.js  # Main JavaScript application
├── example_data.js         # Example network datasets
└── README.md              # This file
```

## Usage

### Adding Entities
1. Enter entity name and select type
2. Set importance level (affects node size)
3. Optionally add a date for timeline layouts

### Creating Relationships
1. Select source and target entities
2. Define relationship type and status
3. Add optional date information

### Exporting Artwork
1. Click "Generate Artwork"
2. Choose format (Instagram, Twitter/Web, or High Resolution)
3. Add title, subtitle, and notes
4. Download or share the generated image

## License

This project is created as a demonstration of network visualization techniques inspired by Mark Lombardi's work.

## Attribution

"The basic unit is the individual and the corporation, and the 'silent partners' are the covert relationships." — Mark Lombardi

Created with inspiration from Mark Lombardi's network diagrams and investigative journalism practices.
