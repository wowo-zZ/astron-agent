package com.iflytek.astron.console.hub.service.bot.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.iflytek.astron.console.hub.entity.CustomSpeaker;
import com.iflytek.astron.console.hub.mapper.CustomSpeakerMapper;
import com.iflytek.astron.console.hub.service.bot.CustomSpeakerService;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class CustomSpeakerServiceImpl extends ServiceImpl<CustomSpeakerMapper, CustomSpeaker> implements CustomSpeakerService {

    @Override
    public List<CustomSpeaker> getTrainSpeaker(Long spaceId, String uid) {
        LambdaQueryWrapper<CustomSpeaker> queryWrapper = Wrappers.lambdaQuery(CustomSpeaker.class)
                .eq(CustomSpeaker::getDeleted, 0)
                .select(CustomSpeaker::getId, CustomSpeaker::getName, CustomSpeaker::getAssetId);
        if (spaceId == null) {
            queryWrapper.eq(CustomSpeaker::getCreateUid, uid);
            queryWrapper.isNull(CustomSpeaker::getSpaceId);
        } else {
            queryWrapper.eq(CustomSpeaker::getSpaceId, spaceId);
        }
        return baseMapper.selectList(queryWrapper);
    }

    @Override
    public void updateTrainSpeaker(Long id, String name, Long spaceId, String uid) {
        LambdaUpdateWrapper<CustomSpeaker> updateWrapper = Wrappers.lambdaUpdate(CustomSpeaker.class)
                .set(CustomSpeaker::getName, name)
                .eq(CustomSpeaker::getId, id)
                .eq(CustomSpeaker::getDeleted, 0);
        if (spaceId == null) {
            updateWrapper.eq(CustomSpeaker::getCreateUid, uid);
            updateWrapper.isNull(CustomSpeaker::getSpaceId);
        } else {
            updateWrapper.eq(CustomSpeaker::getSpaceId, spaceId);
        }
        baseMapper.update(null, updateWrapper);
    }

    @Override
    public void deleteTrainSpeaker(Long id, Long spaceId, String uid) {
        LambdaUpdateWrapper<CustomSpeaker> updateWrapper = Wrappers.lambdaUpdate(CustomSpeaker.class)
                .set(CustomSpeaker::getDeleted, 1)
                .eq(CustomSpeaker::getId, id)
                .eq(CustomSpeaker::getDeleted, 0);
        if (spaceId == null) {
            updateWrapper.eq(CustomSpeaker::getCreateUid, uid);
            updateWrapper.isNull(CustomSpeaker::getSpaceId);
        } else {
            updateWrapper.eq(CustomSpeaker::getSpaceId, spaceId);
        }
        baseMapper.update(null, updateWrapper);
    }
}




