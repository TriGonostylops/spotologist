package com.spotologist.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.spotologist.backend")
public class SpotologistApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpotologistApplication.class, args);
	}

}
