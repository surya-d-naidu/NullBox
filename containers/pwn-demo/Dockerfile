FROM ubuntu:latest

RUN apt-get update && apt-get install -y netcat-openbsd

# Create a user to run the service
RUN useradd -m ctf

WORKDIR /home/ctf

# The flag
RUN echo "CTF{ghost_protocol_initiated}" > /home/ctf/flag.txt
RUN chmod 444 /home/ctf/flag.txt

# The vulnerable service script (in real life this would be a binary)
COPY --chown=root:root start.sh /start.sh
RUN chmod +x /start.sh

USER ctf

CMD ["/start.sh"]
