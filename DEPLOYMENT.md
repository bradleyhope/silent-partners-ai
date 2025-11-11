# Silent Partners - Render Deployment Guide

## Quick Deploy to Render

This project is configured for easy deployment to Render.com with both the static frontend and Flask API server.

### Prerequisites

1. A Render.com account (free tier available)
2. GitHub repository connected to Render
3. OpenAI API key (for AI extraction features)

### Deployment Steps

#### Option 1: Automatic Deployment (Recommended)

1. **Connect Repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub account
   - Select the `silent-partners-ai` repository
   - Render will automatically detect `render.yaml` and create both services

2. **Configure Environment Variables**
   - In the API service settings, add:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `FLASK_ENV`: `production` (already set in render.yaml)
     - `CORS_ORIGINS`: `*` (already set in render.yaml)

3. **Deploy**
   - Click "Apply" to deploy both services
   - Wait 3-5 minutes for deployment to complete

#### Option 2: Manual Deployment

If you prefer to deploy services individually:

**Frontend (Static Site):**
1. New → Static Site
2. Connect repository
3. Build Command: (leave empty)
4. Publish Directory: `.`
5. Deploy

**API Server:**
1. New → Web Service
2. Connect repository
3. Runtime: Python 3
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `gunicorn -w 4 -b 0.0.0.0:$PORT api_server:app`
6. Add environment variable: `OPENAI_API_KEY`
7. Deploy

### Post-Deployment Configuration

#### Update API Endpoint in Frontend

If deploying API separately, update the API endpoint in your frontend code:

1. Open `ai-extraction.js`
2. Find the API endpoint configuration
3. Update to your Render API URL: `https://your-api-name.onrender.com`

#### Custom Domain (Optional)

1. Go to service settings in Render
2. Click "Custom Domain"
3. Add your domain and follow DNS instructions

### Environment Variables

Required for API server:

- `OPENAI_API_KEY`: Your OpenAI API key for AI extraction
- `FLASK_ENV`: Set to `production`
- `CORS_ORIGINS`: Set to `*` or your frontend domain

### Service URLs

After deployment, you'll have:

- **Frontend**: `https://silent-partners-frontend.onrender.com`
- **API**: `https://silent-partners-api.onrender.com`

### Testing Deployment

1. Open the frontend URL
2. Click the 🤖 button to open AI extraction
3. Paste some text and test extraction
4. Verify PNG export works
5. Test theme switching

### Troubleshooting

**API not responding:**
- Check Render logs for errors
- Verify `OPENAI_API_KEY` is set correctly
- Check CORS configuration

**Frontend not loading:**
- Verify all files are committed to GitHub
- Check build logs in Render dashboard
- Ensure `index.html` is in root directory

**AI extraction not working:**
- Check browser console for errors
- Verify API endpoint is correct
- Test API health endpoint: `https://your-api.onrender.com/api/health`

### Free Tier Limitations

Render free tier includes:
- ✅ 750 hours/month for web services
- ✅ Unlimited static sites
- ✅ Auto-deploy from GitHub
- ⚠️ Services sleep after 15 min of inactivity (first request may be slow)
- ⚠️ 100GB bandwidth/month

For production use, consider upgrading to paid tier for:
- No sleep/downtime
- More bandwidth
- Better performance

### Monitoring

Monitor your deployment:
- Render Dashboard: View logs, metrics, deployment history
- Health Check: `https://your-api.onrender.com/api/health`
- GitHub Actions: Auto-deploy on push to master

### Updating

To update your deployment:
1. Push changes to GitHub
2. Render automatically redeploys
3. Check deployment logs for any errors

### Support

For issues:
- Check Render documentation: https://render.com/docs
- Review application logs in Render dashboard
- Test locally first: `python3 api_server.py`

---

## Local Development

To run locally:

```bash
# Install dependencies
pip3 install -r requirements.txt

# Set environment variable
export OPENAI_API_KEY=your_key_here

# Run API server
python3 api_server.py

# Open frontend
open index.html
```

---

## Architecture

```
┌─────────────────────────────────────┐
│  Static Frontend (Render)          │
│  - HTML/CSS/JS                      │
│  - AI Extraction UI                 │
│  - Network Visualization            │
│  - Client-side processing           │
└─────────────────┬───────────────────┘
                  │
                  │ API Calls
                  │
┌─────────────────▼───────────────────┐
│  Flask API Server (Render)          │
│  - REST endpoints                   │
│  - Network data management          │
│  - CORS enabled                     │
└─────────────────┬───────────────────┘
                  │
                  │ OpenAI API
                  │
┌─────────────────▼───────────────────┐
│  OpenAI API                         │
│  - GPT-4.1 Mini                     │
│  - Entity extraction                │
│  - Relationship inference           │
└─────────────────────────────────────┘
```

---

## Cost Estimate

**Render Hosting:** Free tier
**OpenAI API:** 
- $0.007 per document (with inference)
- 100 docs/day = $21/month
- 1000 docs/day = $210/month

**Total:** Very affordable for most use cases!
