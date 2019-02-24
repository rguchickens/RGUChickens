#! /bin/bash
kill -SIGUSR2 $(ps aux | grep '[n]ode app.js' | awk '{print $2}')
