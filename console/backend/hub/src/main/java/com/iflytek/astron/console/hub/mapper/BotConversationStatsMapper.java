package com.iflytek.astron.console.hub.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.iflytek.astron.console.hub.dto.publish.BotSummaryStatsVO;
import com.iflytek.astron.console.hub.dto.publish.BotTimeSeriesStatsVO;
import com.iflytek.astron.console.hub.entity.BotConversationStats;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * Bot conversation statistics Mapper
 */
@Mapper
public interface BotConversationStatsMapper extends BaseMapper<BotConversationStats> {


    /**
     * Query bot overall statistics data
     *
     * @param botId Bot ID
     * @param uid User ID (can be null, means query all users)
     * @param spaceId Space ID (can be null)
     * @return Overall statistics data
     */
    BotSummaryStatsVO selectSummaryStats(@Param("botId") Integer botId,
            @Param("uid") Long uid,
            @Param("spaceId") Long spaceId);

    /**
     * Query bot time series statistics data
     *
     * @param botId Bot ID
     * @param startDate Start date
     * @param uid User ID (can be null, means query all users)
     * @param spaceId Space ID (can be null)
     * @return Time series statistics data
     */
    List<BotTimeSeriesStatsVO> selectTimeSeriesStats(@Param("botId") Integer botId,
            @Param("startDate") LocalDate startDate,
            @Param("uid") Long uid,
            @Param("spaceId") Long spaceId);

}
