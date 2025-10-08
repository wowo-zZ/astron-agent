package com.iflytek.astron.console.commons.service.space;

import com.iflytek.astron.console.commons.dto.space.EnterpriseSpaceCountVO;
import com.iflytek.astron.console.commons.dto.space.SpaceVO;
import com.iflytek.astron.console.commons.entity.space.Space;
import com.iflytek.astron.console.commons.enums.space.SpaceTypeEnum;
import com.iflytek.astron.console.commons.mapper.space.SpaceMapper;
import com.iflytek.astron.console.commons.service.space.impl.SpaceServiceImpl;
import com.iflytek.astron.console.commons.util.RequestContextUtil;
import com.iflytek.astron.console.commons.util.space.EnterpriseInfoUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Comprehensive unit tests for SpaceService interface
 * Tests all methods with various scenarios including edge cases and error conditions
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SpaceService Unit Tests")
class SpaceServiceTest {

    @Mock
    private SpaceMapper spaceMapper;

    @Mock
    private RedissonClient redissonClient;

    @Mock
    private RBucket<Object> rBucket;

    @InjectMocks
    private SpaceServiceImpl spaceService;

    private Space testSpace;
    private SpaceVO testSpaceVO;
    private EnterpriseSpaceCountVO testCountVO;

    @BeforeEach
    void setUp() {
        // Initialize test data
        testSpace = new Space();
        testSpace.setId(1L);
        testSpace.setName("Test Space");
        testSpace.setDescription("Test Description");
        testSpace.setAvatarUrl("http://test.com/avatar.jpg");
        testSpace.setUid("test-uid");
        testSpace.setEnterpriseId(1L);
        testSpace.setType(1);
        testSpace.setCreateTime(LocalDateTime.now());
        testSpace.setUpdateTime(LocalDateTime.now());
        testSpace.setDeleted(0);

        testSpaceVO = new SpaceVO();
        testSpaceVO.setId(1L);
        testSpaceVO.setName("Test Space");
        testSpaceVO.setDescription("Test Description");
        testSpaceVO.setAvatarUrl("http://test.com/avatar.jpg");
        testSpaceVO.setUid("test-uid");
        testSpaceVO.setEnterpriseId(1L);
        testSpaceVO.setCreateTime(LocalDateTime.now());
        testSpaceVO.setUpdateTime(LocalDateTime.now());
        testSpaceVO.setOwnerName("Test Owner");
        testSpaceVO.setMemberCount(5);
        testSpaceVO.setUserRole(1);
        testSpaceVO.setApplyStatus(1);
        testSpaceVO.setLastVisitTime(LocalDateTime.now());

        testCountVO = new EnterpriseSpaceCountVO();
        testCountVO.setTotal(10L);
        testCountVO.setJoined(5L);
    }

    @Test
    @DisplayName("Should return recent visit list successfully")
    void testRecentVisitList_Success() {
        // Given
        String testUid = "test-uid";
        Long testEnterpriseId = 1L;
        List<SpaceVO> expectedList = Arrays.asList(testSpaceVO);

        try (MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class);
             MockedStatic<EnterpriseInfoUtil> mockedEnterpriseInfo = mockStatic(EnterpriseInfoUtil.class)) {
            
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            mockedEnterpriseInfo.when(EnterpriseInfoUtil::getEnterpriseId).thenReturn(testEnterpriseId);
            when(spaceMapper.recentVisitList(testUid, testEnterpriseId)).thenReturn(expectedList);

            // When
            List<SpaceVO> result = spaceService.recentVisitList();

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals(testSpaceVO.getId(), result.get(0).getId());
            verify(spaceMapper).recentVisitList(testUid, testEnterpriseId);
        }
    }

    @Test
    @DisplayName("Should return empty list when no recent visits")
    void testRecentVisitList_EmptyResult() {
        // Given
        String testUid = "test-uid";
        Long testEnterpriseId = 1L;

        try (MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class);
             MockedStatic<EnterpriseInfoUtil> mockedEnterpriseInfo = mockStatic(EnterpriseInfoUtil.class)) {
            
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            mockedEnterpriseInfo.when(EnterpriseInfoUtil::getEnterpriseId).thenReturn(testEnterpriseId);
            when(spaceMapper.recentVisitList(testUid, testEnterpriseId)).thenReturn(Collections.emptyList());

            // When
            List<SpaceVO> result = spaceService.recentVisitList();

            // Then
            assertNotNull(result);
            assertTrue(result.isEmpty());
        }
    }

    @Test
    @DisplayName("Should return personal list with name filter")
    void testPersonalList_WithNameFilter() {
        // Given
        String testUid = "test-uid";
        Long testEnterpriseId = 1L;
        String nameFilter = "test";
        List<SpaceVO> expectedList = Arrays.asList(testSpaceVO);

        try (MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class);
             MockedStatic<EnterpriseInfoUtil> mockedEnterpriseInfo = mockStatic(EnterpriseInfoUtil.class)) {
            
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            mockedEnterpriseInfo.when(EnterpriseInfoUtil::getEnterpriseId).thenReturn(testEnterpriseId);
            when(spaceMapper.joinList(testUid, testEnterpriseId, nameFilter)).thenReturn(expectedList);

            // When
            List<SpaceVO> result = spaceService.personalList(nameFilter);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            verify(spaceMapper).joinList(testUid, testEnterpriseId, nameFilter);
        }
    }

    @Test
    @DisplayName("Should return personal list without name filter")
    void testPersonalList_WithoutNameFilter() {
        // Given
        String testUid = "test-uid";
        Long testEnterpriseId = 1L;
        List<SpaceVO> expectedList = Arrays.asList(testSpaceVO);

        try (MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class);
             MockedStatic<EnterpriseInfoUtil> mockedEnterpriseInfo = mockStatic(EnterpriseInfoUtil.class)) {
            
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            mockedEnterpriseInfo.when(EnterpriseInfoUtil::getEnterpriseId).thenReturn(testEnterpriseId);
            when(spaceMapper.joinList(testUid, testEnterpriseId, null)).thenReturn(expectedList);

            // When
            List<SpaceVO> result = spaceService.personalList(null);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
        }
    }

    @Test
    @DisplayName("Should return personal self list")
    void testPersonalSelfList() {
        // Given
        String testUid = "test-uid";
        Long testEnterpriseId = 1L;
        String nameFilter = "test";
        List<SpaceVO> expectedList = Arrays.asList(testSpaceVO);

        try (MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class);
             MockedStatic<EnterpriseInfoUtil> mockedEnterpriseInfo = mockStatic(EnterpriseInfoUtil.class)) {
            
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            mockedEnterpriseInfo.when(EnterpriseInfoUtil::getEnterpriseId).thenReturn(testEnterpriseId);
            when(spaceMapper.personalSelfList(testUid, testEnterpriseId, nameFilter)).thenReturn(expectedList);

            // When
            List<SpaceVO> result = spaceService.personalSelfList(nameFilter);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            verify(spaceMapper).personalSelfList(testUid, testEnterpriseId, nameFilter);
        }
    }

    @Test
    @DisplayName("Should return corporate join list")
    void testCorporateJoinList() {
        // Given
        String testUid = "test-uid";
        Long testEnterpriseId = 1L;
        String nameFilter = "test";
        List<SpaceVO> expectedList = Arrays.asList(testSpaceVO);

        try (MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class);
             MockedStatic<EnterpriseInfoUtil> mockedEnterpriseInfo = mockStatic(EnterpriseInfoUtil.class)) {
            
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            mockedEnterpriseInfo.when(EnterpriseInfoUtil::getEnterpriseId).thenReturn(testEnterpriseId);
            when(spaceMapper.corporateJoinList(testUid, testEnterpriseId, nameFilter)).thenReturn(expectedList);

            // When
            List<SpaceVO> result = spaceService.corporateJoinList(nameFilter);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            verify(spaceMapper).corporateJoinList(testUid, testEnterpriseId, nameFilter);
        }
    }

    @Test
    @DisplayName("Should return corporate list")
    void testCorporateList() {
        // Given
        String testUid = "test-uid";
        Long testEnterpriseId = 1L;
        String nameFilter = "test";
        List<SpaceVO> expectedList = Arrays.asList(testSpaceVO);

        try (MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class);
             MockedStatic<EnterpriseInfoUtil> mockedEnterpriseInfo = mockStatic(EnterpriseInfoUtil.class)) {
            
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            mockedEnterpriseInfo.when(EnterpriseInfoUtil::getEnterpriseId).thenReturn(testEnterpriseId);
            when(spaceMapper.corporateList(testUid, testEnterpriseId, nameFilter)).thenReturn(expectedList);

            // When
            List<SpaceVO> result = spaceService.corporateList(nameFilter);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            verify(spaceMapper).corporateList(testUid, testEnterpriseId, nameFilter);
        }
    }

    @Test
    @DisplayName("Should return corporate count")
    void testCorporateCount() {
        // Given
        String testUid = "test-uid";
        Long testEnterpriseId = 1L;

        try (MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class);
             MockedStatic<EnterpriseInfoUtil> mockedEnterpriseInfo = mockStatic(EnterpriseInfoUtil.class)) {
            
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            mockedEnterpriseInfo.when(EnterpriseInfoUtil::getEnterpriseId).thenReturn(testEnterpriseId);
            when(spaceMapper.corporateCount(testUid, testEnterpriseId)).thenReturn(testCountVO);

            // When
            EnterpriseSpaceCountVO result = spaceService.corporateCount();

            // Then
            assertNotNull(result);
            assertEquals(testCountVO.getTotal(), result.getTotal());
            assertEquals(testCountVO.getJoined(), result.getJoined());
            verify(spaceMapper).corporateCount(testUid, testEnterpriseId);
        }
    }

    @Test
    @DisplayName("Should return space VO")
    void testGetSpaceVO() {
        // Given
        String testUid = "test-uid";
        Long testEnterpriseId = 1L;

        try (MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class);
             MockedStatic<EnterpriseInfoUtil> mockedEnterpriseInfo = mockStatic(EnterpriseInfoUtil.class)) {
            
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            mockedEnterpriseInfo.when(EnterpriseInfoUtil::getEnterpriseId).thenReturn(testEnterpriseId);
            when(spaceMapper.getSpaceVO(testUid, testEnterpriseId)).thenReturn(testSpaceVO);

            // When
            SpaceVO result = spaceService.getSpaceVO();

            // Then
            assertNotNull(result);
            assertEquals(testSpaceVO.getId(), result.getId());
            verify(spaceMapper).getSpaceVO(testUid, testEnterpriseId);
        }
    }

    @Test
    @DisplayName("Should set last visit personal space time")
    void testSetLastVisitPersonalSpaceTime() {
        // Given
        String testUid = "test-uid";
        String expectedKey = "USER_LAST_VISIT_PERSONAL_SPACE_TIME:" + testUid;

        try (MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class)) {
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            when(redissonClient.getBucket(expectedKey)).thenReturn(rBucket);

            // When
            spaceService.setLastVisitPersonalSpaceTime();

            // Then
            verify(redissonClient).getBucket(expectedKey);
            verify(rBucket).set(any(LocalDateTime.class));
        }
    }

    @Test
    @DisplayName("Should return last visit space")
    void testGetLastVisitSpace() {
        // Given
        String testUid = "test-uid";
        String expectedKey = "USER_LAST_VISIT_PERSONAL_SPACE_TIME:" + testUid;

        try (MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class)) {
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            when(redissonClient.getBucket(expectedKey)).thenReturn(rBucket);
            when(rBucket.get()).thenReturn(LocalDateTime.now());

            // When
            SpaceVO result = spaceService.getLastVisitSpace();

            // Then
            verify(redissonClient).getBucket(expectedKey);
            verify(rBucket).get();
        }
    }

    @Test
    @DisplayName("Should return null when no last visit time")
    void testGetLastVisitSpace_NoLastVisitTime() {
        // Given
        String testUid = "test-uid";
        String expectedKey = "USER_LAST_VISIT_PERSONAL_SPACE_TIME:" + testUid;

        try (MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class)) {
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            when(redissonClient.getBucket(expectedKey)).thenReturn(rBucket);
            when(rBucket.get()).thenReturn(null);

            // When
            SpaceVO result = spaceService.getLastVisitSpace();

            // Then
            assertNull(result);
        }
    }

    @Test
    @DisplayName("Should count spaces by enterprise ID")
    void testCountByEnterpriseId() {
        // Given
        Long enterpriseId = 1L;
        Long expectedCount = 5L;
        when(spaceMapper.countByEnterpriseId(enterpriseId)).thenReturn(expectedCount);

        // When
        Long result = spaceService.countByEnterpriseId(enterpriseId);

        // Then
        assertEquals(expectedCount, result);
        verify(spaceMapper).countByEnterpriseId(enterpriseId);
    }

    @Test
    @DisplayName("Should count spaces by UID")
    void testCountByUid() {
        // Given
        String uid = "test-uid";
        Long expectedCount = 3L;
        when(spaceMapper.countByUid(uid)).thenReturn(expectedCount);

        // When
        Long result = spaceService.countByUid(uid);

        // Then
        assertEquals(expectedCount, result);
        verify(spaceMapper).countByUid(uid);
    }

    @Test
    @DisplayName("Should get space by ID")
    void testGetSpaceById() {
        // Given
        Long spaceId = 1L;
        when(spaceMapper.selectById(spaceId)).thenReturn(testSpace);

        // When
        Space result = spaceService.getSpaceById(spaceId);

        // Then
        assertNotNull(result);
        assertEquals(testSpace.getId(), result.getId());
        verify(spaceMapper).selectById(spaceId);
    }

    @Test
    @DisplayName("Should return null when space not found")
    void testGetSpaceById_NotFound() {
        // Given
        Long spaceId = 999L;
        when(spaceMapper.selectById(spaceId)).thenReturn(null);

        // When
        Space result = spaceService.getSpaceById(spaceId);

        // Then
        assertNull(result);
    }

    @Test
    @DisplayName("Should list spaces by enterprise ID and UID")
    void testListByEnterpriseIdAndUid() {
        // Given
        Long enterpriseId = 1L;
        String uid = "test-uid";
        List<SpaceVO> expectedList = Arrays.asList(testSpaceVO);
        when(spaceMapper.joinList(uid, enterpriseId, null)).thenReturn(expectedList);

        // When
        List<SpaceVO> result = spaceService.listByEnterpriseIdAndUid(enterpriseId, uid);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(spaceMapper).joinList(uid, enterpriseId, null);
    }

    @Test
    @DisplayName("Should check if space exists by name - exists")
    void testCheckExistByName_Exists() {
        // Given
        String name = "Test Space";
        Long id = 1L;
        Long enterpriseId = 1L;

        try (MockedStatic<EnterpriseInfoUtil> mockedEnterpriseInfo = mockStatic(EnterpriseInfoUtil.class)) {
            mockedEnterpriseInfo.when(EnterpriseInfoUtil::getEnterpriseId).thenReturn(enterpriseId);
            when(spaceMapper.selectCount(any())).thenReturn(1L);

            // When
            boolean result = spaceService.checkExistByName(name, id);

            // Then
            assertTrue(result);
        }
    }

    @Test
    @DisplayName("Should check if space exists by name - not exists")
    void testCheckExistByName_NotExists() {
        // Given
        String name = "Non-existent Space";
        Long id = 1L;
        Long enterpriseId = 1L;

        try (MockedStatic<EnterpriseInfoUtil> mockedEnterpriseInfo = mockStatic(EnterpriseInfoUtil.class)) {
            mockedEnterpriseInfo.when(EnterpriseInfoUtil::getEnterpriseId).thenReturn(enterpriseId);
            when(spaceMapper.selectCount(any())).thenReturn(0L);

            // When
            boolean result = spaceService.checkExistByName(name, id);

            // Then
            assertFalse(result);
        }
    }

    @Test
    @DisplayName("Should check if space exists by name with null enterprise ID")
    void testCheckExistByName_NullEnterpriseId() {
        // Given
        String name = "Test Space";
        Long id = 1L;
        String testUid = "test-uid";

        try (MockedStatic<EnterpriseInfoUtil> mockedEnterpriseInfo = mockStatic(EnterpriseInfoUtil.class);
             MockedStatic<RequestContextUtil> mockedRequestContext = mockStatic(RequestContextUtil.class)) {
            
            mockedEnterpriseInfo.when(EnterpriseInfoUtil::getEnterpriseId).thenReturn(null);
            mockedRequestContext.when(RequestContextUtil::getUID).thenReturn(testUid);
            when(spaceMapper.selectCount(any())).thenReturn(0L);

            // When
            boolean result = spaceService.checkExistByName(name, id);

            // Then
            assertFalse(result);
        }
    }

    @Test
    @DisplayName("Should get space type - FREE")
    void testGetSpaceType_Free() {
        // Given
        Long spaceId = 1L;
        testSpace.setType(1);
        when(spaceMapper.selectById(spaceId)).thenReturn(testSpace);

        // When
        SpaceTypeEnum result = spaceService.getSpaceType(spaceId);

        // Then
        assertEquals(SpaceTypeEnum.FREE, result);
    }

    @Test
    @DisplayName("Should get space type - PRO")
    void testGetSpaceType_Pro() {
        // Given
        Long spaceId = 1L;
        testSpace.setType(2);
        when(spaceMapper.selectById(spaceId)).thenReturn(testSpace);

        // When
        SpaceTypeEnum result = spaceService.getSpaceType(spaceId);

        // Then
        assertEquals(SpaceTypeEnum.PRO, result);
    }

    @Test
    @DisplayName("Should get space type - TEAM")
    void testGetSpaceType_Team() {
        // Given
        Long spaceId = 1L;
        testSpace.setType(3);
        when(spaceMapper.selectById(spaceId)).thenReturn(testSpace);

        // When
        SpaceTypeEnum result = spaceService.getSpaceType(spaceId);

        // Then
        assertEquals(SpaceTypeEnum.TEAM, result);
    }

    @Test
    @DisplayName("Should get space type - ENTERPRISE")
    void testGetSpaceType_Enterprise() {
        // Given
        Long spaceId = 1L;
        testSpace.setType(4);
        when(spaceMapper.selectById(spaceId)).thenReturn(testSpace);

        // When
        SpaceTypeEnum result = spaceService.getSpaceType(spaceId);

        // Then
        assertEquals(SpaceTypeEnum.ENTERPRISE, result);
    }

    @Test
    @DisplayName("Should return FREE when space ID is null")
    void testGetSpaceType_NullSpaceId() {
        // When
        SpaceTypeEnum result = spaceService.getSpaceType(null);

        // Then
        assertEquals(SpaceTypeEnum.FREE, result);
    }

    @Test
    @DisplayName("Should return null when space not found")
    void testGetSpaceType_SpaceNotFound() {
        // Given
        Long spaceId = 999L;
        when(spaceMapper.selectById(spaceId)).thenReturn(null);

        // When
        SpaceTypeEnum result = spaceService.getSpaceType(spaceId);

        // Then
        assertNull(result);
    }

    @Test
    @DisplayName("Should save space successfully")
    void testSave_Success() {
        // Given
        when(spaceMapper.insert(testSpace)).thenReturn(1);

        // When
        boolean result = spaceService.save(testSpace);

        // Then
        assertTrue(result);
        verify(spaceMapper).insert(testSpace);
    }

    @Test
    @DisplayName("Should fail to save space")
    void testSave_Failure() {
        // Given
        when(spaceMapper.insert(testSpace)).thenReturn(0);

        // When
        boolean result = spaceService.save(testSpace);

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should get space by ID")
    void testGetById() {
        // Given
        Long id = 1L;
        when(spaceMapper.selectById(id)).thenReturn(testSpace);

        // When
        Space result = spaceService.getById(id);

        // Then
        assertNotNull(result);
        assertEquals(testSpace.getId(), result.getId());
        verify(spaceMapper).selectById(id);
    }

    @Test
    @DisplayName("Should remove space by ID successfully")
    void testRemoveById_Success() {
        // Given
        Long id = 1L;
        when(spaceMapper.deleteById(id)).thenReturn(1);

        // When
        boolean result = spaceService.removeById(id);

        // Then
        assertTrue(result);
        verify(spaceMapper).deleteById(id);
    }

    @Test
    @DisplayName("Should fail to remove space by ID")
    void testRemoveById_Failure() {
        // Given
        Long id = 999L;
        when(spaceMapper.deleteById(id)).thenReturn(0);

        // When
        boolean result = spaceService.removeById(id);

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should update space by ID successfully")
    void testUpdateById_Success() {
        // Given
        when(spaceMapper.updateById(testSpace)).thenReturn(1);

        // When
        boolean result = spaceService.updateById(testSpace);

        // Then
        assertTrue(result);
        verify(spaceMapper).updateById(testSpace);
    }

    @Test
    @DisplayName("Should fail to update space by ID")
    void testUpdateById_Failure() {
        // Given
        when(spaceMapper.updateById(testSpace)).thenReturn(0);

        // When
        boolean result = spaceService.updateById(testSpace);

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should handle null input parameters gracefully")
    void testNullInputParameters() {
        // Test with null name
        assertDoesNotThrow(() -> spaceService.personalList(null));
        assertDoesNotThrow(() -> spaceService.personalSelfList(null));
        assertDoesNotThrow(() -> spaceService.corporateJoinList(null));
        assertDoesNotThrow(() -> spaceService.corporateList(null));

        // Test with null IDs
        assertDoesNotThrow(() -> spaceService.countByEnterpriseId(null));
        assertDoesNotThrow(() -> spaceService.countByUid(null));
        assertDoesNotThrow(() -> spaceService.getSpaceById(null));
        assertDoesNotThrow(() -> spaceService.listByEnterpriseIdAndUid(null, null));
        assertDoesNotThrow(() -> spaceService.checkExistByName(null, null));
        assertDoesNotThrow(() -> spaceService.getSpaceType(null));
        assertDoesNotThrow(() -> spaceService.getById(null));
        assertDoesNotThrow(() -> spaceService.removeById(null));
        assertDoesNotThrow(() -> spaceService.updateById(null));
    }

    @Test
    @DisplayName("Should handle empty string parameters")
    void testEmptyStringParameters() {
        // Test with empty string name
        assertDoesNotThrow(() -> spaceService.personalList(""));
        assertDoesNotThrow(() -> spaceService.personalSelfList(""));
        assertDoesNotThrow(() -> spaceService.corporateJoinList(""));
        assertDoesNotThrow(() -> spaceService.corporateList(""));

        // Test with empty string UID
        assertDoesNotThrow(() -> spaceService.countByUid(""));
        assertDoesNotThrow(() -> spaceService.listByEnterpriseIdAndUid(1L, ""));
    }
}
