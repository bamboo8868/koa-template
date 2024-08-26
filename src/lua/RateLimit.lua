local key = KEYS[1]
local max_times = KEYS[2]

max_times = tonumber(max_times)
local times = redis.call('incr',key)
times = tonumber(times)

local ttl = redis.call('ttl', key)
if tonumber(ttl) == -1 then
    redis.call('expire',key,1)
end

if times > max_times then
    return 0
end

if times == 1 then
    redis.call('expire',key,1)
end
return 1