FROM node:20-alpine
# su-exec lets the entrypoint fix volume ownership as root, then drop to the unprivileged "node" user.
RUN apk add --no-cache su-exec
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY public ./public
COPY proofwall-entrypoint.sh /usr/local/bin/proofwall-entrypoint.sh
ENV NODE_ENV=production PORT=3000 PW_DATA=/data/db.json
RUN chmod +x /usr/local/bin/proofwall-entrypoint.sh && mkdir -p /data && chown node:node /data
VOLUME /data
EXPOSE 3000
ENTRYPOINT ["proofwall-entrypoint.sh"]
CMD ["node", "src/server.js"]
