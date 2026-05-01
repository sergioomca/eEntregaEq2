package com.epu.prototipo.config;

import com.epu.prototipo.service.gateway.DcsGateway;
import com.epu.prototipo.service.gateway.MockDcsGateway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("prod")
public class ProdConfig {

    @Bean
    public DcsGateway dcsGateway() {
        return new MockDcsGateway();
    }
}
