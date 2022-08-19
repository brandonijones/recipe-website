package com.example.springbootbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@ServletComponentScan
@SpringBootApplication
public class SpringbootBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringbootBackendApplication.class, args);
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/api/**")
						.allowedOrigins("*")
						.allowedMethods("GET", "POST","PUT", "DELETE")
						.allowedHeaders("Content-Type", "X-Requested-With", "accept", "Origin", "Access-Control-Request-Method",
								"Access-Control-Request-Headers", "Access-Control-Allow-Origin")
						.exposedHeaders("Access-Control-Allow-Origin", "Access-Control-Allow-Credentials")
						.allowCredentials(false).maxAge(3600);


			}
		};
	}

//	@Bean
//	public CorsConfigurationSource corsConfigurationSource() {
//		CorsConfiguration configuration = new CorsConfiguration();
//		configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "https://therecipebowl.netlify.app"));
//		configuration.setAllowedMethods(Arrays.asList("GET", "POST","PUT", "DELETE"));
//		configuration.setAllowedHeaders(Arrays.asList("Content-Type", "X-Requested-With", "accept", "Origin", "Access-Control-Request-Method",
//				"Access-Control-Request-Headers", "Access-Control-Allow-Origin"));
//		configuration.setAllowCredentials(true);
//		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//		source.registerCorsConfiguration("/**", configuration);
//		return source;
//	}
}
