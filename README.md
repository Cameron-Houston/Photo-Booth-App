# Vintage Photo Booth App

A web application that transforms your photos into vintage photo booth strips. Upload 3 or more photos and create beautiful, retro-style photo strips with various themes.

## Features

- Upload multiple photos (minimum 3)
- Vintage photo booth strip layout
- Multiple theme options
- Automatic photo storage
- Responsive design with a girly aesthetic

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_BUCKET_NAME=your_bucket_name
GOOGLE_CLOUD_CREDENTIALS=your_service_account_json
```

3. Run the development server:
```bash
npm run dev
```

4. Deploy to Netlify:
```bash
netlify deploy
```

## Technologies Used

- React
- Material-UI
- Google Cloud Storage
- Netlify Functions
- HTML2Canvas

## Development

To start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`
#   P h o t o - B o o t h - A p p  
 