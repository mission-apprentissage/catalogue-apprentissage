location /metabase/ {
    proxy_pass              http://metabase:3000/;
    proxy_set_header        Host $host;
    proxy_set_header        X-Real-IP $remote_addr;
    proxy_set_header        X-Forwarded-Host $server_name;
    proxy_set_header        X-Forwarded-Proto $scheme;
    proxy_hide_header       Content-Security-Policy;
}
