import Docker from 'dockerode';

// Default to local socket, or env var if provided
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export default docker;

/**
 * Starts a container for a given challenge.
 * @param imageName The Docker image name to run
 * @param internalPort The internal port the service listens on (e.g., 80, 1337)
 * @returns Object containing containerId and the assigned hostPort
 */
export async function startChallengeContainer(imageName: string, internalPort: number) {
    try {
        // Ensure image exists? For now assume it does or Docker will error (or pull if configured)
        // To be safe, we might want to try pulling, but let's keep it simple.

        const container = await docker.createContainer({
            Image: imageName,
            ExposedPorts: {
                [`${internalPort}/tcp`]: {}
            },
            HostConfig: {
                PortBindings: {
                    [`${internalPort}/tcp`]: [{ HostPort: '0' }] // 0 means Docker assigns a random available port
                },
                AutoRemove: true, // Container is removed when it stops
            },
            Tty: true // Often useful for CTF challenges
        });

        await container.start();

        const data = await container.inspect();
        const bindings = data.NetworkSettings.Ports[`${internalPort}/tcp`];

        if (!bindings || bindings.length === 0) {
            // cleanup if failed to bind
            await container.stop();
            throw new Error('Failed to bind port');
        }

        const hostPort = bindings[0].HostPort;

        return {
            containerId: container.id,
            hostPort: parseInt(hostPort, 10)
        };
    } catch (error) {
        console.error('Error starting container:', error);
        throw error;
    }
}

export async function stopContainer(containerId: string) {
    try {
        const container = docker.getContainer(containerId);
        await container.stop();
        // AutoRemove handles deletion. If not, we'd call container.remove();
    } catch (error) {
        console.error(`Error stopping container ${containerId}:`, error);
        // Ignore error if container is already gone (404)
    }
}
