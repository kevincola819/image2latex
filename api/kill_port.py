import os
import signal
import subprocess

def kill_port(port):
    try:
        output = subprocess.check_output(['lsof', '-t', '-i', f':{port}'])
        pids = output.decode().strip().split('\n')
        for pid in pids:
            if pid:
                print(f"Killing process {pid} on port {port}")
                os.kill(int(pid), signal.SIGKILL)
    except subprocess.CalledProcessError:
        print(f"No process found on port {port}")

kill_port(8000)
