package com.hiresense.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@RestController
@RequestMapping("/api/tts")
public class TtsController {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(6))
            .build();

    @GetMapping(produces = "audio/mpeg")
    public ResponseEntity<byte[]> streamTts(
            @RequestParam("text") String text,
            @RequestParam(value = "lang", defaultValue = "en-US") String lang) {
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            String encodedText = URLEncoder.encode(text.trim(), StandardCharsets.UTF_8);
            String encodedLang = URLEncoder.encode(lang.trim(), StandardCharsets.UTF_8);
            String googleTtsUrl = "https://translate.google.com/translate_tts?ie=UTF-8&tl=" + encodedLang
                    + "&client=tw-ob&q=" + encodedText;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(googleTtsUrl))
                    .timeout(Duration.ofSeconds(8))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .header("Referer", "https://translate.google.com/")
                    .header("Accept", "*/*")
                    .GET()
                    .build();

            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() == 200) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.valueOf("audio/mpeg"));
                headers.setCacheControl("public, max-age=86400");
                return new ResponseEntity<>(response.body(), headers, HttpStatus.OK);
            } else {
                return ResponseEntity.status(response.statusCode()).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
