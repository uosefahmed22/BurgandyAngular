# Burgandy Frontend-Backend Integration Checklist

## Frontend Status: ✅ READY

The Angular 21+ frontend is fully configured and ready to connect to the API.

### Environment Configuration
- ✅ API URL: `https://localhost:7156/api`
- ✅ All 5 services created (Settings, Category, Product, Reservation, API)
- ✅ All components implemented
- ✅ TypeScript strict mode enabled
- ✅ Tailwind CSS with custom burgundy palette
- ✅ RTL/Arabic support
- ✅ Build verified: `npm run build` ✓
- ✅ Dev server ready: `npm start`

---

## API Verification: ✅ CONFIRMED

All endpoints verified via Scalar MCP API documentation.

### Confirmed Endpoints

#### ✅ Settings
- **GET** `/api/Settings` - Get store settings
- **PUT** `/api/Settings` - Update store settings

#### ✅ Categories  
- **GET** `/api/Categories?activeOnly=true` - Get all categories
- **GET** `/api/Categories/{id}` - Get category by ID

#### ✅ Products
- **GET** `/api/Products?pageIndex=1&pageSize=10` - Get products paginated
- **GET** `/api/Products/{id}` - Get product by ID
- **POST** `/api/Products/{id}/toggle-availability` - Toggle availability

#### ✅ Reservations
- **POST** `/api/Reservations` - Create reservation
- **GET** `/api/Reservations/track?code=X&phone=X` - Track reservation
- **GET** `/api/Reservations` - List reservations (admin)
- **GET** `/api/Reservations/{id}` - Get reservation by ID

---

## Backend Checklist: ⏳ VERIFY

Before testing, ensure the backend has these configured:

### API Server Requirements

- [ ] API running on `https://localhost:7156`
- [ ] All endpoints responding with status 200
- [ ] Response format: `{statusCode, message, data}`
- [ ] CORS configured for `http://localhost:4200`
- [ ] SSL certificate valid or self-signed allowed

### CORS Configuration Required

```
Allow-Origin: http://localhost:4200
Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Allow-Headers: Content-Type, Authorization
Allow-Credentials: true
```

### Database/Data Requirements

- [ ] Store Settings configured (name, phone, address, hours)
- [ ] At least 3 active categories with data
- [ ] At least 10 products with:
  - [ ] Name, description, price
  - [ ] Sizes (comma-separated string)
  - [ ] Colors (comma-separated string)
  - [ ] Images with accessible URLs
  - [ ] isAvailable flag

### Test Data Suggested

**Store Settings:**
```json
{
  "id": 1,
  "storeName": "Burgandy",
  "whatsAppNumber": "201001234567",
  "address": "Cairo, Egypt",
  "workingHours": "9 AM - 9 PM",
  "logoUrl": "https://example.com/logo.png"
}
```

**Sample Category:**
```json
{
  "id": 1,
  "name": "Dresses",
  "description": "Latest dresses collection",
  "isActive": true,
  "displayOrder": 1
}
```

**Sample Product:**
```json
{
  "id": 1,
  "name": "Classic Dress",
  "description": "Beautiful classic design",
  "price": 299.99,
  "categoryId": 1,
  "categoryName": "Dresses",
  "sizes": "XS, S, M, L, XL",
  "colors": "Red, Blue, Black",
  "isAvailable": true,
  "images": [
    {
      "id": 1,
      "productId": 1,
      "imageUrl": "https://example.com/product1.jpg",
      "displayOrder": 1
    }
  ]
}
```

---

## Testing Checklist

### Step 1: Verify API is Running
```bash
# Check API connectivity
curl -k https://localhost:7156/api/settings

# Expected response:
# {"statusCode":200,"message":"Success","data":{...}}
```

### Step 2: Start Frontend Dev Server
```bash
cd /mnt/d/Projects/Burgandy/BurgandyAngular
npm start
```

### Step 3: Test Each Page

#### Home Page (http://localhost:4200)
- [ ] Header displays store name from API
- [ ] Logo shows (if configured)
- [ ] Categories section displays from API
- [ ] Footer shows store info
- [ ] WhatsApp button functional
- [ ] Mobile menu works

#### Products Page (http://localhost:4200/products)
- [ ] Products load from API
- [ ] Pagination works
- [ ] Product cards display correctly
- [ ] Product images load
- [ ] Click product navigates to details

#### Product Details (http://localhost:4200/products/1)
- [ ] Product info displays
- [ ] Images gallery works
- [ ] Sizes and colors show
- [ ] "Book Now" button functional

#### Create Reservation (http://localhost:4200/reserve/1)
- [ ] Form displays product info
- [ ] Form fields validate
- [ ] Submit creates reservation
- [ ] Success message shows reservation code

#### Track Reservation (http://localhost:4200/track)
- [ ] Form accepts code and phone
- [ ] Search finds reservation
- [ ] Reservation details display
- [ ] Status badge shows

### Step 4: Browser Console Check
- [ ] No CORS errors
- [ ] No 404 errors
- [ ] No TypeScript errors
- [ ] All network requests successful

### Step 5: Performance Check
- [ ] Initial load < 3 seconds
- [ ] API responses < 1 second
- [ ] Product pagination < 500ms
- [ ] No console warnings

---

## Common Issues & Fixes

### Issue: CORS Error
```
Access to XMLHttpRequest from origin 'http://localhost:4200' has been 
blocked by CORS policy
```
**Fix**: Configure CORS in .NET API
```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", builder =>
        builder.WithOrigins("http://localhost:4200")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials());
});

app.UseCors("AllowLocalhost");
```

### Issue: SSL Certificate Error
```
SSL: CERTIFICATE_VERIFY_FAILED
```
**Fix**: Either:
1. Install valid SSL certificate
2. Or temporarily disable verification (dev only)

### Issue: 404 Not Found
```
GET /api/products - 404 Not Found
```
**Fix**:
- Verify endpoint paths are correct (case-insensitive in .NET)
- Check API version
- Verify database has data
- Check routing configuration

### Issue: Empty Response
**Fix**:
- Verify database has test data
- Check API returns proper JSON format
- Verify response includes "data" property

### Issue: No Data Displaying
**Fix**:
- Check browser console for errors
- Verify API returns 200 status
- Check response format matches expectations
- Verify data is not null/empty

---

## Success Criteria

✅ Integration successful if:
- [ ] All API endpoints respond
- [ ] CORS headers present
- [ ] Frontend loads without errors
- [ ] All pages display data from API
- [ ] Create reservation works
- [ ] Track reservation works
- [ ] No console errors
- [ ] RTL layout correct
- [ ] Mobile responsive
- [ ] Performance acceptable

---

## Quick Start Guide

### To Test Everything:

```bash
# 1. Make sure backend API is running on https://localhost:7156
# 2. Ensure database has test data
# 3. Verify CORS is configured

# 4. Start frontend
cd /mnt/d/Projects/Burgandy/BurgandyAngular
npm start

# 5. Open browser
# http://localhost:4200

# 6. Check DevTools (F12) for any errors
# All should show green ✅
```

---

## Contact Points

### Frontend Code Location
- Services: `/src/app/core/services/`
- Models: `/src/app/core/models/`
- Components: `/src/app/features/`
- Environment: `/src/environments/environment.ts`

### Key Files to Review
- API Configuration: `src/environments/environment.ts`
- Base API Service: `src/app/core/services/api.service.ts`
- All Services: `src/app/core/services/*.service.ts`

---

## Sign-Off

- **Frontend Build**: ✅ PASSED
- **Type Checking**: ✅ PASSED (strict mode)
- **API Endpoint Verification**: ✅ PASSED (Scalar MCP)
- **Service Configuration**: ✅ VERIFIED
- **Environment Setup**: ✅ CONFIGURED

**Status**: Frontend ready for integration testing
**Awaiting**: Backend API running and CORS configured

---

**Last Updated**: 2026-04-14 14:22 UTC
**Frontend Version**: Angular 21+ (Standalone)
**API Version**: v1 (Burgandy API)
**Build Status**: ✅ Success
