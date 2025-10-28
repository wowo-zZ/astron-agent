package com.iflytek.astron.console.hub.service.bot;

import com.iflytek.astron.console.hub.entity.CustomSpeaker;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

public interface CustomSpeakerService extends IService<CustomSpeaker> {

    List<CustomSpeaker> getTrainSpeaker(Long spaceId, String uid);

    void updateTrainSpeaker(Long id, String name, Long spaceId, String uid);
}
