package com.fire.suppression.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Esp32StatusDTO {
    private Double pan;
    private Integer tilt;
    private List<Integer> sensors;
    @JsonProperty("tilt_sensor")
    private Integer tiltSensor;
    private Boolean pump;
    @JsonProperty("temp_ambient")
    private Double tempAmbient;
    @JsonProperty("temp_object")
    private Double tempObject;
}
