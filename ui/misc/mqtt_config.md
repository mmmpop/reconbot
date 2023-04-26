allow_anonymous false

acl_file /mosquitto/config/acl.conf
password_file /mosquitto/config/passwd.conf

max_keepalive 90

max_packet_size 5120
message_size_limit 5120

max_queued_bytes 50

max_queued_messages 1000
allow_zero_length_clientid false
connection_messages true

log_type error
log_type warning
log_type notice
log_type subscribe
log_type unsubscribe

listener 9001
protocol websockets
websockets_log_level all

listener 1883