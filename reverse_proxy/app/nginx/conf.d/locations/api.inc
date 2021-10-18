location /api {
    include /etc/nginx/conf.d/locations/fragments/proxy_api.inc;

    location  ~ \.ndjson {
        proxy_buffering off;
        include /etc/nginx/conf.d/locations/fragments/proxy_api.inc;
    }
}
