#!/bin/bash
# A simple infinite loop that serves the flag via netcat on port 1337
# This mimics a service listening on a port.
while true; do echo "Welcome to the NullBox Shell. Here is your flag: $(cat /home/ctf/flag.txt)" | nc -l -p 1337 -q 1; done
