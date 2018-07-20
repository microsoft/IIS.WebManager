export class ServerSnapshot {
    network: {
        bytes_sent_sec: number;
        bytes_recv_sec: number;
        connection_attempts_sec: number;
        total_bytes_sent: number;
        total_bytes_recv: number;
        total_connection_attempts: number;
        current_connections: number;
    };
    requests: {
        active: number;
        per_sec: number;
        total: number;
    };
    memory: {
        handles,
        private_bytes: number;
        private_working_set: number;
        system_in_use: number;
        installed: number;
    };
    cpu: {
        threads: number;
        processes: number;
        percent_usage: number;
        system_percent_usage: number;
    };
    disk: {
        io_write_operations_sec: number;
        io_read_operations_sec: number;
        page_faults_sec: number;
    };
    cache: {
        file_cache_count: number;
        file_cache_memory_usage: number;
        file_cache_hits: number;
        file_cache_misses: number;
        total_files_cached: number;
        output_cache_count: number;
        output_cache_memory_usage: number;
        output_cache_hits: number;
        output_cache_misses: number;
        uri_cache_count: number;
        uri_cache_hits: number;
        uri_cache_misses: number;
        total_uris_cached
    }
}