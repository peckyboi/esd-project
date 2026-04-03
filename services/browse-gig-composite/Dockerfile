# Python base image
FROM python:3.11-slim

# Working directory
WORKDIR /code

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Expose port
EXPOSE 8087

# Run the app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8087"]
