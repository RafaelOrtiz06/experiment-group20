FROM python

RUN groupadd -r user && useradd -r -g user user

EXPOSE 8000

WORKDIR /offers_microservice

ADD requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

RUN chown -R user:user .
RUN ["chmod", "+x", "cli/run_service.sh"]

CMD ["/bin/bash", "cli/run_service.sh"]

USER user