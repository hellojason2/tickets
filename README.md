# Name Mixer Chat Application

An intelligent name mixing application that combines passenger names using Grok AI to find correlations and create natural-sounding mixed names.

## Features

- Side-by-side name input interface
- Real-time AI-powered name mixing using Grok 4
- Intelligent correlation matching between names
- Modern, responsive UI design
- Secure backend API with environment variable protection

## How It Works

The application uses a specific algorithm to mix names:

1. Takes 3 letters from the right side's first name and adds them to the left side's first name
2. Takes 3 letters from the right side's last name and adds them to the left side's last name
3. Uses Grok AI to find correlations and overlapping patterns for natural combinations

### Examples

**Example 1:**
- Left: John Doe
- Right: Kelly Connor
- Result: **kelJohn conDoe**

**Example 2:**
- Left: John Doe
- Right: Kelly Dong
- Result: **kelJohn Done** (correlation: removing 'n' from 'Done' reveals 'Doe')

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- XAI API Key (for Grok API access)

### Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Add your XAI API key to the `.env` file:
     ```
     XAI_API_KEY=your_actual_api_key_here
     ```

3. **Run the server:**
   ```bash
   python server.py
   ```

4. **Access the application:**
   - Open your browser and navigate to: `http://localhost:5000`

## Project Structure

```
tickets/
├── server.py              # Flask backend server with Grok API integration
├── index.html            # Main HTML structure
├── styles.css            # CSS styling for the interface
├── app.js                # Frontend JavaScript logic
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (not tracked in git)
├── .env.example          # Example environment file
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## API Endpoint

### POST `/api/mix-names`

**Request Body:**
```json
{
  "leftFirstName": "John",
  "leftLastName": "Doe",
  "rightFirstName": "Kelly",
  "rightLastName": "Connor"
}
```

**Response:**
```json
{
  "mixedFirstName": "kelJohn",
  "mixedLastName": "conDoe"
}
```

## Technologies Used

- **Backend:** Python, Flask, xai-sdk
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **AI:** Grok 4 (via XAI SDK)

## Security Notes

- API keys are stored in environment variables
- `.env` file is excluded from git
- CORS is configured for local development
- For production, update CORS settings and use HTTPS

## Troubleshooting

**Issue: "XAI_API_KEY not found"**
- Make sure you've created a `.env` file with your API key

**Issue: "Failed to mix names"**
- Check that your API key is valid
- Ensure you have internet connectivity
- Verify that the Grok API service is available

**Issue: Frontend can't connect to backend**
- Ensure the Flask server is running on port 5000
- Check browser console for CORS or network errors

## License

This project is for demonstration purposes.

