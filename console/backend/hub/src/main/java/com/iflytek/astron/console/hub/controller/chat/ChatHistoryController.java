package com.iflytek.astron.console.hub.controller.chat;

import com.alibaba.fastjson2.JSONArray;
import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.commons.util.RequestContextUtil;
import com.iflytek.astron.console.commons.service.data.ChatDataService;
import com.iflytek.astron.console.commons.service.data.ChatListDataService;
import com.iflytek.astron.console.hub.dto.chat.ChatEnhanceChatHistoryListFileVo;
import com.iflytek.astron.console.hub.dto.chat.ChatHistoryResponseDto;
import com.iflytek.astron.console.commons.dto.chat.ChatReqModelDto;
import com.iflytek.astron.console.commons.dto.chat.ChatRespModelDto;
import com.iflytek.astron.console.commons.entity.chat.ChatList;
import com.iflytek.astron.console.commons.entity.chat.ChatReasonRecords;
import com.iflytek.astron.console.commons.entity.chat.ChatTraceSource;
import com.iflytek.astron.console.commons.entity.chat.ChatTreeIndex;
import com.iflytek.astron.console.hub.service.chat.ChatEnhanceService;
import com.iflytek.astron.console.hub.service.chat.ChatHistoryMultiModalService;
import com.iflytek.astron.console.hub.service.chat.ChatReasonRecordsService;
import com.iflytek.astron.console.hub.service.chat.TraceToSourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author mingsuiyongheng
 */
@RestController
@Slf4j
@Tag(name = "Chat History")
@RequestMapping("/chat-history")
public class ChatHistoryController {

    @Autowired
    private ChatDataService chatDataService;

    @Autowired
    private TraceToSourceService traceToSourceService;

    @Autowired
    private ChatReasonRecordsService chatReasonRecordsService;

    @Autowired
    private ChatHistoryMultiModalService chatHistoryMultiModalService;

    @Autowired
    private ChatEnhanceService chatEnhanceService;

    @Autowired
    private ChatListDataService chatListDataService;

    /**
     * Get chat history based on chatId
     *
     */
    @GetMapping("/all/{chatId}")
    @Operation(summary = "Get Chat History by chatId")
    public ApiResult<List<ChatHistoryResponseDto>> getAllChatHistory(@PathVariable Long chatId) {
        String uid = RequestContextUtil.getUID();
        // Check if chatId belongs to uid
        ChatList chatList = chatListDataService.findByUidAndChatId(uid, chatId);
        if (chatList == null) {
            return ApiResult.error(ResponseEnum.CHAT_REQ_NOT_BELONG_ERROR);
        }
        try {
            List<ChatHistoryResponseDto> allTreeHistory = new ArrayList<>(8);
            List<ChatTreeIndex> chatTreeIndexList = chatListDataService.getListByRootChatId(chatId, uid);
            chatTreeIndexList.forEach(e -> {
                allTreeHistory.add(getMessageHistory(uid, e.getChildChatId(), chatList));
            });
            return ApiResult.success(allTreeHistory);
        } catch (Exception e) {
            log.info("Current tree structure exception, chatId:{}", chatId, e);
            return ApiResult.error(ResponseEnum.CHAT_NORMAL_TREE_ERROR);
        }
    }

    /**
     * Function to get message history
     *
     * @param uid User ID
     * @param chatId Chat room ID
     * @param chatList Chat list
     * @return Returns ChatHistoryResponseDto object containing chat history
     */
    private ChatHistoryResponseDto getMessageHistory(String uid, Long chatId, ChatList chatList) {
        // Get multi-modal question history
        List<ChatReqModelDto> reqList = chatDataService.getReqModelBotHistoryByChatId(uid, chatId);
        if (reqList.isEmpty()) {
            reqList = new ArrayList<>();
        }
        // Get multi-modal answer history
        List<ChatRespModelDto> respList = chatDataService.getChatRespModelBotHistoryByChatId(uid, chatId, new ArrayList<>());
        if (respList == null) {
            respList = new ArrayList<>();
        }
        // Get trace history in chat
        List<ChatTraceSource> traceList = chatDataService.findTraceSourcesByChatId(chatId);
        // Bind trace history to answers
        traceToSourceService.respAddTrace(respList, traceList);
        // Get reasoning history for chat conversations
        List<ChatReasonRecords> reasonRecordsList = chatDataService.getReasonRecordsByChatId(chatId);
        // Bind reasoning content to answers
        chatReasonRecordsService.assembleRespReasoning(respList, reasonRecordsList, traceList);
        List<Object> assembledHistoryList;
        // If structure doesn't exist, assemble according to original rules
        assembledHistoryList = chatHistoryMultiModalService.mergeChatHistory(reqList, respList, chatList.getBotId());

        Map<String, Object> chatFileList = chatEnhanceService.addHistoryChatFile(assembledHistoryList, uid, chatId);

        ChatHistoryResponseDto responseDto = new ChatHistoryResponseDto();
        responseDto.setChatId(chatId);
        responseDto.setChatFileListNoReq((List<ChatEnhanceChatHistoryListFileVo>) chatFileList.get("chatFileListNoReq"));
        Object historyListObj = chatFileList.get("historyList");
        if (historyListObj instanceof JSONArray) {
            responseDto.setHistoryList((JSONArray) historyListObj);
        } else if (historyListObj instanceof List) {
            responseDto.setHistoryList(new JSONArray((List<?>) historyListObj));
        } else if (historyListObj != null) {
            responseDto.setHistoryList(JSONArray.parseArray(historyListObj.toString()));
        } else {
            responseDto.setHistoryList(new JSONArray());
        }
        responseDto.setBusinessType(chatFileList.get("businessType") == null ? null : chatFileList.get("businessType").toString());
        responseDto.setExistChatFileSize((Integer) chatFileList.get("existChatFileSize"));
        responseDto.setExistChatImage((Boolean) chatFileList.get("existChatImage"));
        responseDto.setEnabledPluginIds(chatList.getEnabledPluginIds());

        return responseDto;
    }
}
