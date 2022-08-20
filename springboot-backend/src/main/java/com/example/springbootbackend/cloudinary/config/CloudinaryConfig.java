package com.example.springbootbackend.cloudinary.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.stereotype.Component;

@Component
@PropertySource(value = "classpath:application.properties", ignoreResourceNotFound = true)
public class CloudinaryConfig {

//    @Value("${app.cloudinary.cloud-name}")
    private final String CLOUDINARY_CLOUD_NAME;

//    @Value("${app.cloudinary.api-key}")
    private final String CLOUDINARY_API_KEY;

//    @Value("${app.cloudinary.api-secret}")
    private final String CLOUDINARY_API_SECRET;

    @Autowired
    public CloudinaryConfig(@Value("${app.cloudinary.cloud-name}") String cloudName,
                            @Value("${app.cloudinary.api-key}") String apiKey,
                            @Value("${app.cloudinary.api-secret}") String apiSecret) {
        this.CLOUDINARY_CLOUD_NAME = cloudName;
        this.CLOUDINARY_API_KEY = apiKey;
        this.CLOUDINARY_API_SECRET = apiSecret;
    }

    public String getCloudName() {
        return CLOUDINARY_CLOUD_NAME;
    }

    public String getApiKey() {
        return CLOUDINARY_API_KEY;
    }

    public String getApiSecret() {
        return CLOUDINARY_API_SECRET;
    }

    public String toString() {
        return "Cloudname: " + CLOUDINARY_CLOUD_NAME + "\n" +
                "API Key: " + CLOUDINARY_API_KEY + "\n" +
                "API Secret: " + CLOUDINARY_API_SECRET;
    }

    public Cloudinary getInstance() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", CLOUDINARY_CLOUD_NAME,
                "api_key", CLOUDINARY_API_KEY,
                "api_secret", CLOUDINARY_API_SECRET,
                "secure", true
        ));
    }
}
