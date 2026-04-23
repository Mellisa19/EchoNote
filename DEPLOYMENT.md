# 🚀 EchoNote Deployment Guide

## **Quick Start - Railway (Recommended)**

### **Step 1: Deploy to Railway**
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Select your `EchoNote` repository
4. Railway will automatically detect it's a Node.js app

### **Step 2: Configure Environment Variables**
In Railway dashboard, add these environment variables:

```bash
OPENAI_API_KEY=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
PORT=3000
FIREBASE_PROJECT_ID=echonote-bd009
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@echonote-bd009.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCshoOdDA99ESnJ\npKj2NzJbQIy1+xTLODx+18XSeZl6sVFRAxUNwsxOejEdZS5j677P5XW17dnq1dZi\nOG089dti0YbwDVY83awT8f7eBGsrUk0Ufup+8hKz9Gy5teZDmtUIj/UQoiBGYqdn\n7sjoh7F6+uMGT4HchaxiXcYAARhTM1j+D0g5l2CrVLn4EKhz6nTMcfB5gtv9nKvt\naFaP2o+0L8B9gH0kZAfBJCKQ9jpux6/7ixmTH8o0EoOIfhk/E5aY0HN7ZQxQUTbR\nMdBSQxTiy3pJ3RE7nxVPG6amUzGZWSynb8Slz8ye5wyVGVi4T8Mjx9NkPRohAkH7\nHACP3wBlAgMBAAECggEAEWIZpMXwUZOxzYVvw3na8w1/9V4abEIlpkoraSz4upS0\niCBytfOTY7I1fKwTOTIprweEYr5XygJIcEEV5fcyZwnhj2e98V1h1z33hiXqfm+e\ndfA2bxqzqQ95slnnnOw0MYFVGfCb++Y4zo9lYuM5OMD1WvoWhZevv4GJ+mTMhKVq\nFQ8hTHvHfJYj7tuci9dWQe1E8HCU3nT8rZMtPLV+NsHNLxVVXIDuCmfpxFdUqQfX\nx+3oeNH3SVJmThA9HWJBOM3ADkjhmg44Kjzt5QX2BPR4G2PPN+CZn83bh2NJUlHO\nOgT39IStHL/yZZmtCiPO7j5VhTKqt3GBFzQWq5soSQKBgQDd3NwikcqJlpKiHIGm\n/ZjOzEy44NUGPW/aC41Ij8EefYMuJVXsSosNDjT/3XKJN1u+bCDtFPUQImDokUwC\n3qdXFduybWnBsjutLPLgVgnd5W4WTQdReOsIz9rdc5zcDq74cCjTwwJ0VXTWWP9n\n1p3e64oWsJ18zSyUAygfGBJrcwKBgQDHEkQJRCZRjIPWRlF9l/lvDj/hzO5zIrQu\nO35d8e7+cyBPa/7eoGG097X8ACfTAikMu5IqyN6OUHwX/QQCxkdX0ScenTUCSo7s\n8r987DsPpKTdLswwQKE6DA3EURMyC5CEp20dpPshspIPj8Kv/ZndhhCReu/eReU3\nxn2DWbIexwKBgDgrQlA+ONi8lkMUlH6Clb1FW+cyhLwfscGySwKj4nCltiBos2gv\nNyUHA8QDfIvgyAldtrhPJfv/uCkpH+VaGWOi1QxHRw8S4KjnSFYjcjwLaeObfM7T\nni2M8gw+yOetj/615qA2LtjlCb96qK7RVwao+zzjWfvOtgqDAhVdMsyhAoGBAK+o\ncXqPtRQ+XlLkJ6IgSQxy0XHIqBvWYpFtE9uH0PCb28XZMMN3V+AcuGuOI5XxERHY\nLWktaBzB7k4oh7J/DZLyzocYBx9ndOimZsuvk4oBKSy2z5xAW0PiQP+a3spJJBO5\nvPHsk2Cvtmye2Rb8Oxoa42HLzf8fQ9zMfBI8Qo0fAoGBALXsatdsz/OsdS1Abr3F\n2OhaxvBv9z2ACoI6UwitFYXv3SFwIXqg5thfr39qq/bwH5ieD0BpWou/Z4nn1tm+\nC74KNeV97qX1f4IXGJu8LDybIsHrxo1Byai+TyfjYaVtKT8uJuTbYToaSRVOzrgQ\nbypNANOeUNc/zFgtgNvTsVDx\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://echonote-bd009-default-rtdb.europe-west1.firebasedatabase.app/
NODE_ENV=production
```

### **Step 3: Deploy**
- Click "Deploy" 
- Railway will build and deploy your app
- Your app will be available at `https://your-app-name.railway.app`

---

## **Alternative: Vercel Deployment**

### **Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

### **Step 2: Deploy**
```bash
vercel --prod
```

### **Step 3: Set Environment Variables**
```bash
vercel env add OPENAI_API_KEY
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY
vercel env add FIREBASE_DATABASE_URL
```

---

## **Alternative: Heroku Deployment**

### **Step 1: Install Heroku CLI**
```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### **Step 2: Create App**
```bash
heroku create your-app-name
```

### **Step 3: Set Environment Variables**
```bash
heroku config:set OPENAI_API_KEY=your_key
heroku config:set FIREBASE_PROJECT_ID=your_project_id
heroku config:set FIREBASE_CLIENT_EMAIL=your_email
heroku config:set FIREBASE_PRIVATE_KEY="your_private_key"
heroku config:set FIREBASE_DATABASE_URL=your_database_url
```

### **Step 4: Deploy**
```bash
git push heroku main
```

---

## **Production Considerations**

### **File Storage**
For production, consider using cloud storage instead of local files:
- **AWS S3** or **Google Cloud Storage** for audio files
- **CloudFront** or **CDN** for static assets

### **Database**
- **Firebase Firestore** is already configured
- Consider **Redis** for session storage
- **MongoDB Atlas** as alternative to Firebase

### **Security**
- Enable HTTPS (automatic on most platforms)
- Set up CORS for your domain
- Use environment variables for all secrets
- Consider rate limiting for API endpoints

### **Monitoring**
- Set up **Sentry** for error tracking
- Use **LogRocket** for session replay
- Monitor API usage and costs

---

## **Custom Domain Setup**

### **Railway**
1. Go to Railway dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records

### **Vercel**
1. Go to Vercel dashboard → Domains
2. Add your domain
3. Follow DNS instructions

### **Heroku**
1. `heroku domains:add yourdomain.com`
2. Update DNS records

---

## **Testing Your Deployment**

After deployment, test these endpoints:

```bash
# Test main page
curl https://your-app-url.com/

# Test API health
curl https://your-app-url.com/api/meetings

# Test file upload (with auth)
curl -X POST https://your-app-url.com/api/upload \
  -H "Authorization: Bearer your_token" \
  -F "audio=@test-file.mp3"
```

---

## **Troubleshooting**

### **Common Issues**

**Build fails**
- Check `package.json` has correct start script
- Verify all dependencies are in production dependencies
- Check for syntax errors

**Environment variables not working**
- Ensure variables are set in platform dashboard
- Restart app after adding variables
- Check for special characters in keys

**Firebase connection issues**
- Verify service account key format
- Check Firebase project settings
- Ensure database URL is correct

**File upload issues**
- Ensure upload directory exists
- Check file permissions
- Verify file size limits

### **Getting Help**

- Check platform logs
- Review deployment logs
- Test locally with production env vars
- Check API key validity

---

## **Cost Estimates**

### **Railway**
- Free: $5/month credit
- Hobby: $5/month
- Pro: $20/month

### **Vercel**
- Free: 100GB bandwidth, Pro features
- Pro: $20/month
- Enterprise: Custom

### **Heroku**
- Eco: $5/month
- Basic: $7/month
- Standard: $25/month

### **Additional Costs**
- OpenAI API: ~$0.006/minute of audio
- Firebase: Free tier, then ~$25/month
- Storage: ~$0.023/GB/month

---

## **Next Steps**

1. Choose your platform (Railway recommended)
2. Follow the platform-specific steps
3. Test all functionality
4. Set up monitoring
5. Configure custom domain
6. Set up backup and recovery

Your EchoNote app is ready for production! 🎉
