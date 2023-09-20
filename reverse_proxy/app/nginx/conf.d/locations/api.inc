location /api {
    include /etc/nginx/conf.d/locations/fragments/proxy_api.inc;

    location  ~ \.json {
       include /etc/nginx/conf.d/locations/fragments/proxy_api.inc;
       send_timeout 1200s;
    }

    location  ~ \.csv {
       include /etc/nginx/conf.d/locations/fragments/proxy_api.inc;
       send_timeout 1200s;
    }
}
