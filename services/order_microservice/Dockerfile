#python img
FROM python:3.11-slim

#working directory
WORKDIR /code

#requirements.txt
COPY ./requirements.txt /code/requirements.txt

#install necessary python packages from requirements
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

#make local directory inside a folder called app inside the container
COPY ./app /code/app

#run the appliction using uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]