# InventoryShop - Full Stack Integration Project

<div align="center">
  <img width="85%" alt="Full Stack Integration Project Screenshot" src="https://github.com/user-attachments/assets/15d352c5-2564-4e8c-914a-e440d9c800d8" />
</div>

A complete inventory management system demonstrating seamless front end and back end integration with optimized performance.

## Project Structure

```
inventoryshop/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── components/
│       └── inventory-manager.js
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── inventory.js
│   ├── models/
│   │   └── item.js
│   └── utils/
│       └── validator.js
├── package.json
├── README.md
└── COPILOT_REFLECTION.md
```

## Features

- Real time inventory tracking
- RESTful API with JSON communication
- Performance optimized queries
- Error handling and validation
- Responsive UI design
- Efficient caching mechanisms

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Data Storage**: In-memory with JSON persistence
- **Communication**: REST API with JSON

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open `frontend/index.html` in your browser

## API Endpoints

- `GET /api/inventory` - Get all items
- `POST /api/inventory` - Add new item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- `GET /api/inventory/search?q=query` - Search items

## Integration Features

- Seamless front-end to backend communication
- Optimized JSON data structures
- Error handling and debugging capabilities
- Performance optimizations with caching
- Real time updates without page refresh