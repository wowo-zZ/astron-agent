package com.iflytek.astron.console.hub.service.chat.impl;

import cn.hutool.core.collection.CollectionUtil;
import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.commons.service.data.ChatListDataService;
import com.iflytek.astron.console.commons.dto.chat.ChatListCreateResponse;
import com.iflytek.astron.console.commons.entity.chat.ChatTreeIndex;
import com.iflytek.astron.console.hub.service.chat.ChatListService;
import com.iflytek.astron.console.hub.service.chat.ChatRestartService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * @author mingsuiyongheng
 */
@Slf4j
@Service
public class ChatRestartServiceImpl implements ChatRestartService {

    @Autowired
    private ChatListDataService chatListDataService;

    @Autowired
    private ChatListService chatListService;

    /**
     * @param rootChatId Root chat ID
     * @param uid User ID
     * @param chatListName Chat list name
     * @return Returns a new chat list creation response
     * @throws BusinessException Thrown when chat tree index is empty
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChatListCreateResponse createNewTreeIndexByRootChatId(Long rootChatId, String uid, String chatListName) {
        // Retrieve the tree
        List<ChatTreeIndex> chatTreeIndexList = chatListDataService.findChatTreeIndexByChatIdOrderById(rootChatId);
        if (CollectionUtil.isEmpty(chatTreeIndexList)) {
            throw new BusinessException(ResponseEnum.CHAT_TREE_ERROR);
        }

        // Regenerate a chatId
        ChatListCreateResponse chatListCreateResponse = chatListService.createChatListForRestart(uid, chatListName, null, chatTreeIndexList.getFirst().getChildChatId());
        ChatTreeIndex chatTreeIndexLatest = chatTreeIndexList.getFirst();
        if (chatListCreateResponse.getId().equals(chatTreeIndexLatest.getChildChatId())) {
            return chatListCreateResponse;
        }

        ChatTreeIndex chatTreeIndex = ChatTreeIndex.builder()
                .rootChatId(chatTreeIndexLatest.getRootChatId())
                .parentChatId(chatTreeIndexLatest.getChildChatId())
                .childChatId(chatListCreateResponse.getId())
                .uid(uid)
                .build();
        chatListDataService.createChatTreeIndex(chatTreeIndex);
        return chatListCreateResponse;
    }
}
